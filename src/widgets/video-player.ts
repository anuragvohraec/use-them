import { Bloc, BlocBuilderConfig, MultiBlocsReactiveWidget } from "bloc-them";
import { nothing, TemplateResult,html } from "lit-html";
import { XY } from "../interfaces";
import { BogusBloc } from "../utils/blocs";
import { HideBloc } from "./dialogues";
import { ZoomAndPanBloc } from "./gesturedetector";
import { ProgressBloc } from "./loading-bar";

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

    update(newValue:number){
        this.emit(PercentageBloc.calculatePercentage(newValue,this.percentConfig.max)); 
    }
}

export class OnViewPlayVideo extends MultiBlocsReactiveWidget<State>{
    convertSubscribedStatesToReactiveState(subscribed_states?: Record<string, any>): State | undefined {
        if(subscribed_states){
            return {
                hideToolBar: subscribed_states["HideToolBarBloc"],
                progress_percent: subscribed_states["ProgressBarBloc"],
                playerInView: subscribed_states["VideoPlayerInView"]
            }
        }
    }

    constructor(){
        super({
            blocs_map:{
                HideToolBarBloc: new HideBloc(),
                ProgressBarBloc: new PercentageBloc({initState:40,max:100}), //TODO set initState =0
                VideoPlayerInView: new HideBloc(false), //assumes video player not in view
            },
            subscribed_blocs:["HideToolBarBloc","ProgressBarBloc"]
        })
    }

    private videoElement!:HTMLVideoElement;
    private progressBarCont!:HTMLElement;
    private progressBar!:HTMLElement;

    private VideoPlayerInView?:HideBloc;
    private ProgressBarBloc?:PercentageBloc;
    private HideToolBarBloc?:HideBloc;

    connectedCallback(){
        super.connectedCallback();
        setTimeout(()=>{
            this.progressBarCont= this.shadowRoot?.querySelector(".progress-bar-cont") as HTMLElement;
            this.progressBar= this.shadowRoot?.querySelector(".progress") as HTMLElement;

            this.videoElement = this.shadowRoot?.querySelector(".video") as HTMLVideoElement;
            if(this.videoElement){
                // We can only control playback without interaction if video is mute
                this.videoElement.muted=true;

                // Play is a promise so we need to check we have it
                let playPromise = this.videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.then((_) => {
                        let observer = new IntersectionObserver(
                            (entries) => {
                                entries.forEach((entry) => {
                                    if (
                                        entry.intersectionRatio !== 1 &&
                                        !this.videoElement.paused
                                    ) {
                                        this.videoElement.pause();
                                        
                                        setTimeout(()=>{
                                            this.videoElement.muted=true;    
                                        },300);
                                    } else if (this.videoElement.paused) {
                                        this.videoElement.play();
                                        
                                        //video player in view
                                        if(!this.VideoPlayerInView){
                                            this.VideoPlayerInView=this.getBloc<HideBloc>("VideoPlayerInView");
                                        }
                                        this.VideoPlayerInView.emit(true);

                                        setTimeout(()=>{
                                            this.videoElement.muted=false;
                                        },300);
                                    }
                                });
                            },
                            { threshold: 1 }
                        );
                        observer.observe(this.videoElement);
                    });
                }
            }
        },100)
    }

    disconnectedCallback(){
        if(this.videoElement){
            this.videoElement.pause();
            this.videoElement.src="";
        }
        super.disconnectedCallback();
    }

    private muted:boolean=true;

    toggleMute=(e:Event)=>{
        this.muted=!this.muted;
        this.videoElement.muted=this.muted;
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
        </style>
        <ut-pan-zoom-detector bloc="ZoomAndPanBloc" .blocBuilderConfig=${this.zapBlocBuilderConfig as any}>
            <div class="cont">
                <lay-them in="stack">
                    <video class="video" src=${src} preload="none"></video>
                    <div class="seek-bar-cont">
                        <div class="progress-bar-cont">
                            <div class="progress"></div>
                        </div>
                        <div class="progress-stat">
                            <lay-them in="row" ma="space-between">
                                <div class="current_time">2:00</div>
                                <div class="total_time">3:12</div>
                            </lay-them>
                        </div>
                    </div>
                </lay-them>
            </div>
        </ut-pan-zoom-detector>`;
    }

    private get zapBlocBuilderConfig():BlocBuilderConfig<ZoomAndPanBloc,number>{
        if(!this.ProgressBarBloc){
            this.ProgressBarBloc=this.getBloc<PercentageBloc>("ProgressBarBloc");
        }
        if(!this.HideToolBarBloc){
            this.HideToolBarBloc=this.getBloc<HideBloc>("HideToolBarBloc");
        }

        let self=this;
        return {
            blocs_map:{
                ZoomAndPanBloc: new class extends ZoomAndPanBloc{
                    private hideToolBarTimer:any;

                    onPointRelease(xy: XY): void {
                        this.hideToolBarTimer=setTimeout(()=>{
                            if(!self.HideToolBarBloc?.state){
                                self.HideToolBarBloc?.hide();
                            }
                        },2000);
                    }
                    onPointTouch(xy: XY): void {
                        if(this.hideToolBarTimer){
                            clearTimeout(this.hideToolBarTimer);
                        }
                        //if hidden
                        if(self.HideToolBarBloc?.state){
                            self.HideToolBarBloc?.show();
                        }
                    }

                    onZoom=(zoom: number,axis:XY): void=> {
                        //TODO volume control
                    }
                    onPan=(movement: XY,axis:XY): void =>{
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
                            self.ProgressBarBloc.update(calcProgress);
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

}
customElements.define("ut-on-view-video",OnViewPlayVideo);