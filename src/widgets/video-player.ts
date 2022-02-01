import { MultiBlocsReactiveWidget } from "bloc-them";
import { nothing, TemplateResult,html } from "lit-html";
import { HideBloc } from "./dialogues";

interface State{
    hideToolBar:boolean;    
}

export class OnViewPlayVideo extends MultiBlocsReactiveWidget<State>{
    convertSubscribedStatesToReactiveState(subscribed_states?: Record<string, any>): State | undefined {
        if(subscribed_states){
            return {
                hideToolBar: subscribed_states["HideToolBarBloc"]
            }
        }
    }

    constructor(){
        super({
            blocs_map:{
                HideToolBarBloc: new HideBloc()
            },
            subscribed_blocs:["HideToolBarBloc"]
        })
    }

    private videoElement!:HTMLVideoElement;

    connectedCallback(){
        super.connectedCallback();
        setTimeout(()=>{
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
            background-color: var(--video-bg-color,#00000047);
        }
        .seek-bar-cont{
            position: absolute;
            bottom: 0px;
            display: ${state.hideToolBar?"none":"block"};
        }
        </style>
        <div class="cont" @click=${this.toggleToolBar}>
            <lay-them in="stack">
                <video class="video" src=${src} preload="none"></video>
                <div class="seek-bar-cont">
                    <div>Hello world</div>
                </div>
            </lay-them>
        </div>`;
    }

    toggleToolBar=(e:Event)=>{
        this.getBloc<HideBloc>("HideToolBarBloc").toggle();
    }
}
customElements.define("ut-on-view-video",OnViewPlayVideo);