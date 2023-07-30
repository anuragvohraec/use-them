import { Bloc, findBloc, ListenerWidget } from "bloc-them";
import { nothing, TemplateResult,html } from 'bloc-them';

import { UseThemConfiguration } from "../configs";
import { XY } from "../interfaces";

import { Utils } from "../utils/utils";
import { HideBloc } from "./dialogues";
import { ZoomAndPanBloc } from "./gesturedetector";

interface State{
    /**
     * hide or displays seeking bar
     */
    hideToolBar:boolean;
    /**
     * Video progress percentage
     */
    progress_percent:number;
    /**
     * Whether the current player is in view using Intersection Observer
     */
    playerInView:boolean;
    
    /**
     * If true video plays
     */
    play:boolean;

    isBuffering: boolean;

    /**
     * Timings
     */
    timings:{total:string, elapsed:string};

    isNotFullScreen:boolean;
}

export class PercentageBloc extends Bloc<number>{
    protected _name: string="PercentageBloc";

    static calculatePercentage(value:number,max:number){
        return 100*value/max;
    }
    constructor(protected percentConfig:{initState:number,max:number}){
        super(PercentageBloc.calculatePercentage(percentConfig.initState,percentConfig.max));
    }

    set max(newValue:number){
        this.percentConfig.max=newValue;
    }

    get max():number{
        return this.percentConfig.max;
    }

    update(newValue:number){
        this.emit(PercentageBloc.calculatePercentage(newValue,this.percentConfig.max)); 
    }
}

class VideoPlayController extends HideBloc{
    constructor(){
        super(false)
    }

    private _video!: HTMLVideoElement;
    public get video(): HTMLVideoElement {
        return this._video;
    }

    public set video(value: HTMLVideoElement) {
        this._video = value;
        // We can only control playback without interaction if video is mute
        this.video.muted=true;
    }


    private _HideToolBarBloc!: HideBloc;
    public get HideToolBarBloc(): HideBloc {
        if(!this._HideToolBarBloc){
            this._HideToolBarBloc=findBloc<HideBloc>("HideToolBarBloc",this.hostElement)!;
        }
        return this._HideToolBarBloc;
    }
    
    play(){
        this.emit(true);
        let r = this.video.play();
        this.HideToolBarBloc.setTrue();
        setTimeout(()=>{
            this.video.muted=false;
        },300);
        return r;
    }

    isPlaying(){
        return this.state;
    }

    isNotPlaying(){
        return !this.state;
    }

    pause(){
        this.emit(false);
        this.video.pause();
        this.HideToolBarBloc.setFalse();
        setTimeout(()=>{
            this.video.muted=true;    
        },300);
    }

    onDisconnection(){
        if(this.video){
            this.video.pause();
            this.video.src="";
        }
    }
}

class VideoControlMixer extends Bloc<State|undefined>{
    constructor(){
        super(undefined,["HideToolBarBloc","ProgressBarBloc","IsVideoBuffering","VideoPlayerInView","VideoPlayControl"])
    }

    private _ProgressBarBloc!: PercentageBloc;
    public get ProgressBarBloc(): PercentageBloc {
        if(!this._ProgressBarBloc){
            this._ProgressBarBloc=findBloc<PercentageBloc>("ProgressBarBloc",this.hostElement)!;
        }
        return this._ProgressBarBloc;
    }


    protected reactToStateChangeFrom(blocName: string, newState: any): void {
        //@ts-ignore
        let state:State ={};
        if(this.state){
            state={...this.state};
        }
        
        if(blocName==="HideToolBarBloc"){
            state.hideToolBar=newState;
        }else if(blocName==="ProgressBarBloc"){
            state.progress_percent=newState;
            state.timings={
                total: Utils.covertToPlayTime(this.ProgressBarBloc.max),
                elapsed: Utils.covertToPlayTime(this.ProgressBarBloc.state * this.ProgressBarBloc.max/100)
            };
        }else if(blocName==="VideoPlayerInView"){
            state.playerInView=newState;
        }else if(blocName==="VideoPlayControl"){
            state.play=newState;
        }else if(blocName==="IsVideoBuffering"){
            state.isBuffering=newState;
        }else if(blocName==="IsNotFullScreen"){
            state.isNotFullScreen=newState;
        }

        this.emit(state);
    }
}

export class OnViewPlayVideo extends ListenerWidget<State>{


    constructor(){
        super({
            blocName:"VideoControlMixer",
            hostedBlocs:{
                HideToolBarBloc: new HideBloc(),
                ProgressBarBloc: new PercentageBloc({initState:0,max:100}),
                VideoPlayerInView: new HideBloc(false), //assumes video player not in view
                VideoPlayControl: new VideoPlayController(),
                IsVideoBuffering: new HideBloc(false),
                IsNotFullScreen: new HideBloc()
            },
            isShadow:true
        });
    }

    private progressBarCont!:HTMLElement;
    
    private _VideoPlayerInView!: HideBloc;
    public get VideoPlayerInView(): HideBloc {
        if(!this._VideoPlayerInView){
            this._VideoPlayerInView=findBloc<HideBloc>("VideoPlayerInView",this)!;
        }
        return this._VideoPlayerInView;
    }
    private _ProgressBarBloc!: PercentageBloc;
    public get ProgressBarBloc(): PercentageBloc {
        if(!this._ProgressBarBloc){
            this._ProgressBarBloc=findBloc<PercentageBloc>("ProgressBarBloc",this)!;
        }
        return this._ProgressBarBloc;
    }


    private _VideoPlayControl!: VideoPlayController;

    public get VideoPlayControl(): VideoPlayController {
        if(!this._VideoPlayControl){
            this._VideoPlayControl=findBloc<VideoPlayController>("VideoPlayControl",this)!;
            this._VideoPlayControl.video=this.shadowRoot?.querySelector(".video") as HTMLVideoElement;
        }
        return this._VideoPlayControl;
    }
    
    connectedCallback(){
        super.connectedCallback();
        setTimeout(()=>{
            this.progressBarCont= this.shadowRoot?.querySelector(".progress-bar-cont") as HTMLElement;
                // Play is a promise so we need to check we have it
                let playPromise = this.VideoPlayControl.play();
                if (playPromise !== undefined) {
                    playPromise.then((_) => {
                        let observer = new IntersectionObserver(
                            (entries) => {
                                entries.forEach((entry) => {
                                    if (
                                        entry.intersectionRatio < UseThemConfiguration.PLAYER_INTERSECTION_RATIO_FOR_PAUSE &&
                                        this.VideoPlayControl.isPlaying()
                                    ) {
                                        this.VideoPlayControl.pause();
                                        this.VideoPlayerInView?.emit(false);
                                    } else if (entry.intersectionRatio >= UseThemConfiguration.PLAYER_INTERSECTION_RATIO_FOR_PLAY && this.VideoPlayControl.isNotPlaying()) {
                                        /**
                                         * if no autoplay attribute is given the intersection observer is not attached and no auto play is done
                                         */
                                        if(!this.hasAttribute("noautoplay")){
                                            this.VideoPlayControl.play();  
                                        }
                                        //video player in view
                                        this.VideoPlayerInView?.emit(true);  
                                    }
                                });
                            },
                            { threshold: [0,1] }
                        );
                        observer.observe(this.VideoPlayControl.video);
                    });
                }
            
        },100)
    }

    build(state?: State): TemplateResult {
        let src = this.getAttribute("src");
        if(!src || !state){
            return nothing as TemplateResult;
        }

        let poster:string|undefined = this.getAttribute("poster") as any;
        if(!poster){
            poster=undefined;
        }
        
        return html`<style>
        .cont{
            width:100%;
            height:100%;
        }
        .video{
            width: var(--video-width,100%);
            height: var(--video-height,100%);
            background-color: var(--video-bg-color,#0000008a);
        }
        .seek-bar-cont{
            position: absolute;
            bottom: 0px;
            display: ${state.hideToolBar?"none":"flex"};
            width: 100%;
            height: 80px;
            justify-content: flex-end;
            align-items: center;
            flex-direction: column;
            box-sizing: border-box;
            padding: 5px 20px;
            left:0px;
        }
        .progress-bar-cont{
            background-color: white;
            min-height: 5px;
            width: 100%;
            position: relative;
            box-shadow:0px 2px 3px #00000026;
        }
        .progress{
            background-color: var(--theme-color,#ffcc00ff);
            position: absolute;
            left: 0px;
            height: 5px;
            width: ${state.progress_percent+"%"};
        }
        .current_time{
            color: var(--theme-color,#ffcc00ff);
            text-shadow: 0 0 3px #000000c9;
            font-weight: bold;
        }
        .total_time{
            color: white;
            text-shadow: 0 0 3px #000000c9;
            font-weight: bold;
        }
        .progress-stat{
            width: 100%;
        }
        .fullscreen{
            min-width: 50px;
        }
        .pauseIndicator{
            width: 100%;
            height: 100%;
        }
        .buffering{
            top: 25px;
            right: 25px;
        }
        </style>
        
            <div class="cont">
                <lay-them in="stack">
                    <video class="video" @click=${this.pauseVideo} ?poster=${poster} src=${src} preload="none" @timeupdate=${this.followVideoTime} @loadedmetadata=${this.metaDataAvailable} @waiting=${this.isBuffering} @playing=${this.isPlaying}></video>
                    <ut-pan-zoom-detector bloc="ZoomAndPanBloc" .hostedblocs=${this.zapBlocBuilderConfig as any}>
                        <div class="seek-bar-cont">
                            <div class="progress-bar-cont">
                                <div class="progress"></div>
                            </div>
                            <div class="progress-stat">
                                <lay-them in="row" ma="space-between">
                                    <div class="current_time">${state.timings.elapsed}</div>
                                    <div class="fullscreen" @click=${this.toggleFullScreen}>
                                        <ink-well>
                                            ${state.isNotFullScreen?html`<ut-icon icon="fullscreen" use="icon_inactive:white;"></ut-icon>`:html`<ut-icon icon="fullscreen-exit" use="icon_inactive:white;"></ut-icon>`}
                                        </ink-well>
                                    </div>
                                    <div class="total_time">${state.timings.total}</div>
                                </lay-them>
                            </div>
                        </div>
                    </ut-pan-zoom-detector>
                    <div class="buffering">
                    ${state.isBuffering?html`<circular-progress-indicator use="primaryColor:white;"></circular-progress-indicator>`:nothing as TemplateResult}
                    </div>
                    ${state.play?nothing as TemplateResult:html`${poster?html`<div><img src="${poster}" style="width:100%;height:100%;"></div>`:nothing}
                            <div><circular-icon-button @click=${this.playVideo} use="icon:play-arrow;primaryColor: white;radius: 50px;" style="--bg-color:#00000085;"></circular-icon-button></div>`}
                </lay-them>
            </div>`;
    }

    private playVideo=(e:Event)=>{
        this.VideoPlayControl.play();
    }

    private pauseVideo=(e:Event)=>{
        this.VideoPlayControl.pause();
    }


    private toggleFullScreen=(e:Event)=>{
        if (document.fullscreenElement) {
            findBloc<HideBloc>("IsNotFullScreen",this)!.setTrue();
            document.exitFullscreen();
            setTimeout(()=>{
                screen.orientation.lock('portrait');
            },100);
        }else{
            findBloc<HideBloc>("IsNotFullScreen",this)!.setFalse();
            this.shadowRoot!.querySelector(".cont")?.requestFullscreen();
            setTimeout(()=>{
                screen.orientation.lock('landscape');
            },100);
        }
    }

    private _IsVideoBuffering!:HideBloc;
    private get IsVideoBuffering():HideBloc{
        if(!this._IsVideoBuffering){
            this._IsVideoBuffering=findBloc<HideBloc>("IsVideoBuffering",this)!;
        }
        return this._IsVideoBuffering;
    }

    private isBuffering=(e:Event)=>{
        this.IsVideoBuffering.setTrue();
    }
    private isPlaying=(e:Event)=>{
        this.IsVideoBuffering.setFalse();
    }

    private metaDataAvailable=(e:Event)=>{
        this.ProgressBarBloc.max=this.VideoPlayControl.video.duration;
    }

    private followVideoTime=(e:Event)=>{
        this.ProgressBarBloc.update(this.VideoPlayControl.video.currentTime);
    }

    private _zapBlocBuilderConfig!:Record<string, Bloc<any>>;

    private get zapBlocBuilderConfig():Record<string, Bloc<any>>{
        if(!this._zapBlocBuilderConfig){
            let self=this;
            this._zapBlocBuilderConfig={
                ZoomAndPanBloc: new class extends ZoomAndPanBloc{
                    onDoublePointTouch(xy: XY): void {
                        // self.VideoPlayControl.play();
                    }
                    private hideToolBarTimer:any;

                    onPointRelease(xy: XY): void {
                        if(this.changeCurrentTimeTo>=0){
                            //seek video in here
                            self.VideoPlayControl.video.currentTime=this.changeCurrentTimeTo;
                            this.changeCurrentTimeTo=-1;
                            self.VideoPlayControl.pause();
                        }
                    }
                    onPointTouch(xy: XY): void {
                        // self.VideoPlayControl.pause();
                    }

                    onZoom=(zoom: number,axis:XY): void=> {
                        //TODO volume control
                        if(zoom>1.8){
                            self.VideoPlayControl.video.volume=1;
                        }else if(zoom<0.2){
                            self.VideoPlayControl.video.volume=0;
                        }else{
                            self.VideoPlayControl.video.volume=zoom;
                        }
                    }

                    private changeCurrentTimeTo:number=-1;

                    onPan=(movement: XY,axis:XY): void =>{
                        if(this.hideToolBarTimer){
                            clearTimeout(this.hideToolBarTimer);
                            this.hideToolBarTimer=undefined;
                        }

                        //add progress to current progress
                        //x movement
                        let totalProgressWidth=self.progressBarCont.offsetWidth;
                        let additionalProgress=100*movement.x/totalProgressWidth;
                        if(self.ProgressBarBloc){
                            let calcProgress=self.ProgressBarBloc.state+additionalProgress;
                            if(calcProgress<=0){
                                calcProgress=0;
                            }else if(calcProgress>=100){
                                calcProgress=100;
                            }
                            this.changeCurrentTimeTo=calcProgress*self.VideoPlayControl.video.duration/100
                            self.ProgressBarBloc.update(this.changeCurrentTimeTo);
                        }
                    }
    
                    protected _name: string="ZoomAndPanBloc";
                    constructor(){
                        super(0);
                    }
                }
                }
        }
        return this._zapBlocBuilderConfig;
    }

}
customElements.define("ut-on-view-video",OnViewPlayVideo);