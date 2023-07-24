import { MultiBlocsReactiveWidget , Bloc, BlocBuilderConfig} from "bloc-them";
import { nothing, TemplateResult, html} from 'bloc-them';
import { XY } from "../interfaces";
import { Utils } from "../utils/utils";
import { HideBloc } from "./dialogues";
import { ZoomAndPanBloc } from "./gesturedetector";
import { PercentageBloc } from "./video-player";


export class AudioPlayController extends HideBloc{
    constructor(){
        super(false)
    }

    private _audio!: HTMLAudioElement;
    public get audio(): HTMLAudioElement {
        return this._audio;
    }

    public set audio(value: HTMLAudioElement) {
        this._audio = value;
        // We can only control playback without interaction if video is mute
        this.audio.muted=true;
    }
    
    play(){
        this.emit(true);
        let r = this.audio.play();
        setTimeout(()=>{
            this.audio.muted=false;
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
        this.audio.pause();
        setTimeout(()=>{
            this.audio.muted=true;    
        },300);
    }

    onDisconnection(){
        if(this.audio){
            this.audio.pause();
            this.audio.src="";
        }
    }
}


interface State{
    /**
     * Video progress percentage
     */
    progress_percent:number;
    
    /**
     * Timings
     */
    timings:{total:string, elapsed:string};

    /**
     * If true video plays
     */
     play:boolean;
}

class AudioPlayer extends MultiBlocsReactiveWidget<State>{

    private _zapBlocBuilderConfig!:BlocBuilderConfig<number>;

    private get zapBlocBuilderConfig():BlocBuilderConfig<number>{
        if(!this._zapBlocBuilderConfig){
            let self=this;
            this._zapBlocBuilderConfig={
                    blocs_map:{
                        ZoomAndPanBloc: new class extends ZoomAndPanBloc{
                            onDoublePointTouch(xy: XY): void {
                                self.AudioPlayController.play();
                            }
                            private hideToolBarTimer:any;

                            onPointRelease(xy: XY): void {
                                if(this.changeCurrentTimeTo>=0){
                                    //seek video in here
                                    self.AudioPlayController.audio.currentTime=this.changeCurrentTimeTo;
                                    this.changeCurrentTimeTo=-1;
                                    self.AudioPlayController.pause();
                                }
                            }
                            onPointTouch(xy: XY): void {
                                self.AudioPlayController.pause();
                            }

                            onZoom=(zoom: number,axis:XY): void=> {
                                //TODO volume control
                                if(zoom>1.8){
                                    self.AudioPlayController.audio.volume=1;
                                }else if(zoom<0.2){
                                    self.AudioPlayController.audio.volume=0;
                                }else{
                                    self.AudioPlayController.audio.volume=zoom;
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
                                    this.changeCurrentTimeTo=calcProgress*self.AudioPlayController.audio.duration/100
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

    convertSubscribedStatesToReactiveState(subscribed_states?: Record<string, any>): State | undefined {
        if(subscribed_states){
            return {
                timings:{
                    total: Utils.covertToPlayTime(this.ProgressBarBloc.max),
                    elapsed: Utils.covertToPlayTime(this.ProgressBarBloc.state * this.ProgressBarBloc.max/100)
                },
                progress_percent: subscribed_states["ProgressBarBloc"],
                play: subscribed_states["AudioPlayController"],
            }
        }
    }

    private followAudioTime=(e:Event)=>{
        this.ProgressBarBloc.update(this.AudioPlayController.audio.currentTime);
    }

    private metaDataAvailable=(e:Event)=>{
        this.ProgressBarBloc.max=this.AudioPlayController.audio.duration;
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
        .seek-bar-cont{
            position: absolute;
            bottom: 0px;
            display: flex;
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
        .cover,.full{
                width:100%;
                height:100%;
            }
        </style>
        
            <div class="cont">
                <lay-them in="stack">
                    ${poster?html`<div class="cover" @click=${this.pauseAudio}><img class="full" src=${poster}></div>`:html``}
                    <audio class="audio" src=${src} preload="none" @timeupdate=${this.followAudioTime} @loadedmetadata=${this.metaDataAvailable}></audio>
                    <ut-pan-zoom-detector bloc="ZoomAndPanBloc" .blocBuilderConfig=${this.zapBlocBuilderConfig as any}>
                        <div class="seek-bar-cont">
                            <div class="progress-bar-cont">
                                <div class="progress"></div>
                            </div>
                            <div class="progress-stat">
                                <lay-them in="row" ma="space-between">
                                    <div class="current_time">${state.timings.elapsed}</div>
                                    <div class="total_time">${state.timings.total}</div>
                                </lay-them>
                            </div>
                        </div>
                    </ut-pan-zoom-detector>
                    <div class="pauseIndicator">
                        ${state.play?nothing as TemplateResult:html`<circular-icon-button @click=${this.playAudio} use="icon:play-arrow;primaryColor: white;radius: 50px;" style="--bg-color:#00000085;"></circular-icon-button>`}
                    </div>
                </lay-them>
            </div>`;
    }

    private playAudio=(e:Event)=>{
        this.AudioPlayController.play();
    }

    private pauseAudio=(e:Event)=>{
        this.AudioPlayController.pause();
    }

    private _ProgressBarBloc!: PercentageBloc;
    public get ProgressBarBloc(): PercentageBloc {
        if(!this._ProgressBarBloc){
            this._ProgressBarBloc=this.getBloc<PercentageBloc>("ProgressBarBloc");
        }
        return this._ProgressBarBloc;
    }
    
    public audioDetails?:{coverPicURL:string, audioURL:string};
    private progressBarCont!:HTMLElement;
    

    private _AudioPlayController!:AudioPlayController;

    
    public get AudioPlayController() : AudioPlayController {
        if(!this._AudioPlayController){
            this._AudioPlayController=this.getBloc<AudioPlayController>("AudioPlayController");
            this._AudioPlayController.audio=this.shadowRoot?.querySelector(".audio") as HTMLAudioElement;
        }
        return this._AudioPlayController
    }
    

    constructor(){
        super({
            blocs_map:{
                AudioPlayController: new AudioPlayController(),
                ProgressBarBloc: new PercentageBloc({initState:0,max:100}),
                AudioPlayerBloc: new class extends Bloc<any>{
                    protected _name: string="AudioPlayerBloc"
                    constructor(){
                        super(undefined);
                    }

                    onConnection=(ctx:AudioPlayer)=>{
                        super.onConnection(ctx);
                        setTimeout(()=>{
                            ctx.progressBarCont= ctx.shadowRoot?.querySelector(".cont") as HTMLElement;

                            
                                let playPromise = ctx.AudioPlayController.play();
                                if (playPromise !== undefined) {
                                    playPromise.then((_) => {
                                        let observer = new IntersectionObserver(
                                            (entries) => {
                                                entries.forEach((entry) => {
                                                    if (
                                                        entry.intersectionRatio !== 1 &&
                                                        ctx.AudioPlayController.isPlaying()
                                                    ) {
                                                        ctx.AudioPlayController.pause();
                                                    } else if (entry.intersectionRatio === 1 && ctx.AudioPlayController.isNotPlaying()) {
                                                        if(!ctx.hasAttribute("noautoplay")){
                                                            ctx.AudioPlayController.play();
                                                        }
                                                    }
                                                });
                                            },
                                            { threshold: [0,1] }
                                        );
                                        observer.observe(ctx.progressBarCont);
                                    });
                                }
                            
                        },100);  
                    }
                }()
            },
            subscribed_blocs:["AudioPlayController","ProgressBarBloc"]
        })
    }

}
customElements.define("ut-on-view-audio",AudioPlayer);