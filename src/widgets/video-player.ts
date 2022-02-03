import { Bloc, BlocBuilderConfig, MultiBlocsReactiveWidget } from "bloc-them";
import { nothing, TemplateResult,html } from "lit-html";
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
    
    play(){
        this.emit(true);
        let r = this.video.play();
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


export class OnViewPlayVideo extends MultiBlocsReactiveWidget<State>{
    convertSubscribedStatesToReactiveState(subscribed_states?: Record<string, any>): State | undefined {
        if(subscribed_states){
            return {
                hideToolBar: subscribed_states["HideToolBarBloc"],
                progress_percent: subscribed_states["ProgressBarBloc"],
                playerInView: subscribed_states["VideoPlayerInView"],
                play: subscribed_states["VideoPlayControl"],
                timings:{
                    total: Utils.covertToPlayTime(this.ProgressBarBloc.max),
                    elapsed: Utils.covertToPlayTime(this.ProgressBarBloc.state * this.ProgressBarBloc.max/100)
                },
                isBuffering:subscribed_states["IsVideoBuffering"],
                isNotFullScreen: subscribed_states["IsNotFullScreen"]
            }
        }
    }

    constructor(){
        super({
            blocs_map:{
                HideToolBarBloc: new HideBloc(),
                ProgressBarBloc: new PercentageBloc({initState:0,max:100}),
                VideoPlayerInView: new HideBloc(false), //assumes video player not in view
                VideoPlayControl: new VideoPlayController(),
                IsVideoBuffering: new HideBloc(),
                IsNotFullScreen: new HideBloc()
            },
            subscribed_blocs:["HideToolBarBloc","ProgressBarBloc","IsVideoBuffering","VideoPlayerInView","VideoPlayControl"]
        });
    }

    private progressBarCont!:HTMLElement;
    
    private _VideoPlayerInView!: HideBloc;
    public get VideoPlayerInView(): HideBloc {
        if(!this._VideoPlayerInView){
            this._VideoPlayerInView=this.getBloc<HideBloc>("VideoPlayerInView");
        }
        return this._VideoPlayerInView;
    }
    private _ProgressBarBloc!: PercentageBloc;
    public get ProgressBarBloc(): PercentageBloc {
        if(!this._ProgressBarBloc){
            this._ProgressBarBloc=this.getBloc<PercentageBloc>("ProgressBarBloc");
        }
        return this._ProgressBarBloc;
    }

    private _HideToolBarBloc!: HideBloc;
    public get HideToolBarBloc(): HideBloc {
        if(!this._HideToolBarBloc){
            this._HideToolBarBloc=this.getBloc<HideBloc>("HideToolBarBloc");
        }
        return this._HideToolBarBloc;
    }

    private _VideoPlayControl!: VideoPlayController;

    public get VideoPlayControl(): VideoPlayController {
        if(!this._VideoPlayControl){
            this._VideoPlayControl=this.getBloc<VideoPlayController>("VideoPlayControl");
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
                                    entry.intersectionRatio !== 1 &&
                                    this.VideoPlayControl.isPlaying()
                                ) {
                                    this.VideoPlayControl.pause();
                                    this.VideoPlayerInView?.emit(false);
                                } else if (entry.intersectionRatio === 1 && this.VideoPlayControl.isNotPlaying()) {
                                    this.VideoPlayControl.play();
                                    
                                    //video player in view
                                    this.VideoPlayerInView?.emit(true);
                                }
                            });
                        },
                        { threshold: 1 }
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
            height: 50px;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            box-sizing: border-box;
            padding: 20px;
        }
        .progress-bar-cont{
            background-color: white;
            min-height: 5px;
            width: 100%;
            position: relative;
        }
        .progress{
            background-color: var(--theme-color,#ffcc00ff);
            position: absolute;
            left: 0px;
            height: 5px;
            width: ${state.progress_percent}%;
        }
        .current_time{
            color: var(--theme-color,#ffcc00ff);
        }
        .total_time{
            color: white;
        }
        .progress-stat{
            width: 100%;
        }
        .fullscreen{
            min-width: 50px;
        }
        </style>
        <ut-pan-zoom-detector bloc="ZoomAndPanBloc" .blocBuilderConfig=${this.zapBlocBuilderConfig as any}>
            <div class="cont">
                <lay-them in="stack">
                    <video class="video" src=${src} preload="none" @timeupdate=${this.followVideoTime} @loadedmetadata=${this.metaDataAvailable} @waiting=${this.isBuffering} @playing=${this.isPlaying}></video>
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
                    <div class="buffering">
                    ${state.isBuffering?html`<circular-progress-indicator use="primaryColor:white;"></circular-progress-indicator>`:nothing as TemplateResult}
                    </div>
                </lay-them>
            </div>
        </ut-pan-zoom-detector>`;
    }

    private toggleFullScreen=(e:Event)=>{
        if (document.fullscreenElement) {
            this.getBloc<HideBloc>("IsNotFullScreen").setTrue();
            document.exitFullscreen();
            setTimeout(()=>{
                screen.orientation.lock('portrait');
            },100);
        }else{
            this.getBloc<HideBloc>("IsNotFullScreen").setFalse();
            this.shadowRoot!.querySelector(".cont")?.requestFullscreen();
            setTimeout(()=>{
                screen.orientation.lock('landscape');
            },100);
        }
    }

    private _IsVideoBuffering!:HideBloc;
    private get IsVideoBuffering():HideBloc{
        if(!this._IsVideoBuffering){
            this._IsVideoBuffering=this.getBloc<HideBloc>("IsVideoBuffering");
        }
        return this._IsVideoBuffering;
    }

    private isBuffering=(e:Event)=>{
        this.IsVideoBuffering.hide();
    }
    private isPlaying=(e:Event)=>{
        this.IsVideoBuffering.show();
    }

    private metaDataAvailable=(e:Event)=>{
        this.ProgressBarBloc.max=this.VideoPlayControl.video.duration;
    }

    private followVideoTime=(e:Event)=>{
        this.ProgressBarBloc.update(this.VideoPlayControl.video.currentTime);
    }

    private _zapBlocBuilderConfig!:BlocBuilderConfig<number>;

    private get zapBlocBuilderConfig():BlocBuilderConfig<number>{
        if(!this._zapBlocBuilderConfig){
            let self=this;
            this._zapBlocBuilderConfig={
                    blocs_map:{
                        ZoomAndPanBloc: new class extends ZoomAndPanBloc{
                            onDoublePointTouch(xy: XY): void {
                                self.VideoPlayControl.play();
                                self.HideToolBarBloc.hide();
                            }
                            private hideToolBarTimer:any;

                            onPointRelease(xy: XY): void {
                                if(this.changeCurrentTimeTo>=0){
                                    //seek video in here
                                    self.VideoPlayControl.video.currentTime=this.changeCurrentTimeTo;
                                    this.changeCurrentTimeTo=-1;
                                    self.HideToolBarBloc?.show();
                                    self.VideoPlayControl.pause();
                                }
                            }
                            onPointTouch(xy: XY): void {
                                self.VideoPlayControl.pause();
                                self.HideToolBarBloc?.show();
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
        }
        return this._zapBlocBuilderConfig;
    }

}
customElements.define("ut-on-view-video",OnViewPlayVideo);