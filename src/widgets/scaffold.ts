import { Bloc } from 'bloc-them';
import { TemplateResult, html } from 'lit-html';
import { UseThemConfiguration } from '../configs';
import { WidgetBuilder } from '../utils/blocs';
import { OverlayPageBloc, OverlayStatus } from './route-them/overlays';
import { AppPageBloc } from './route-them/RouteThem';

export interface ScaffoldState {
    showMenu: boolean;
    showSnackbar: boolean;
    snackBarMessage?: string;
}

export class ScaffoldBloc extends Bloc<ScaffoldState>{
    protected _name: string="ScaffoldBloc";

    constructor() {
        super({
            showMenu: false,
            showSnackbar: false
        });
    }


    private overlayPageBloc?:OverlayPageBloc;
    private overlayPageBlocListenerId?:string;


    onConnection(ctx:HTMLElement){
        super.onConnection(ctx);
        //listen for OverlayBloc events
        this.overlayPageBloc = OverlayPageBloc.search<OverlayPageBloc>("OverlayPageBloc",ctx);
        if(this.overlayPageBloc && !this.overlayPageBlocListenerId){
            let t:any =(newState:OverlayStatus)=>{
                if(newState && newState.overlay_id === this._name && !newState.show){
                    if(this.state.showMenu){
                        this.toggleMenu();
                    }
                }
            };
            t._ln_name=this._name;
            this.overlayPageBlocListenerId = this.overlayPageBloc._subscribe(t);
        }
    }

    onDisconnection(){
        //stop listening to overlay bloc events
        if(this.overlayPageBloc && this.overlayPageBlocListenerId){
            this.overlayPageBloc._unsubscribe(this.overlayPageBlocListenerId);
        }
    }

    toggleMenu(pushOverlayStack:boolean=true) {
        navigator.vibrate(UseThemConfiguration.PRESS_VIB);
        let newState = { ...this.state };
        newState.showMenu = !newState.showMenu;
        const appPageBloc=AppPageBloc.search<AppPageBloc>("AppPageBloc",this.hostElement);
        if(newState.showMenu && pushOverlayStack){
            appPageBloc?.pushOverlayStack(this._name);
        }
        this.emit(newState);
    }

    /**
     * 
     * @param message : message
     * @param timeout : in milliseconds
     */
    postMessageToSnackBar(message: string, timeout: number = 4000) {
        let newState = { ...this.state };
        newState.showSnackbar = true;
        newState.snackBarMessage = message;
        this.emit(newState);
        setTimeout(() => {
            let newState = { ...this.state };
            newState.showSnackbar = false;
            newState.snackBarMessage = undefined;
            this.emit(newState);
        }, timeout);
    }
}


export class ScaffoldBuilder extends WidgetBuilder<ScaffoldBloc, ScaffoldState>{
    constructor() {
        super("ScaffoldBloc", {
            blocs_map:{
                ScaffoldBloc: new ScaffoldBloc()
            }
        });
    }

    toggleMenuBar=()=>{
        // this.bloc?.toggleMenu();
        AppPageBloc.search<AppPageBloc>("AppPageBloc",this)?.popOutOfCurrentPage();
    }

    builder(state: ScaffoldState): TemplateResult {
        return html`
        <!-- TODO menu bar-->
        <style>
            .appbar {
                min-height: 60px;
                width: 100%;
                z-index: 10;
            }
            .expanded{
                width:100%; 
                height:100%; 
            }
            .glass{
                background-color: ${this.theme.scaffold_menu_glass_color};
            }
            .snack-bar{
                background-color: ${this.theme.snack_bar_bg};position: fixed; bottom: 50px; padding:10px 20px; max-width: 90%; color: white;
            }
        </style>
<div class="expanded">
    <lay-them in="stack">
        <div class="expanded">
            <lay-them for="base of scaffold">
                <div class="appbar">
                    <lay-them in="stack">
                        <div style="height: 60px; position: fixed; width: 100%; box-shadow: ${this.theme.scaffold_title_background_shadow};border-radius: ${this.theme.scaffold_title_bar_border_radius};overflow: hidden;">
                            <slot name="appbar-bg">
                                <svg style="display: ${this.theme.scaffold_title_bar_default_background_display};" version="1.1" viewBox="0 0 100 100" preserveAspectRatio="none" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <defs>
                                        <linearGradient id="linearGradient850" x1="-28.773" x2="119.68" y1="53.936" y2="50.846" gradientUnits="userSpaceOnUse">
                                            <stop stop-color="${this.theme.secondaryColor}" offset="0"></stop>
                                            <stop stop-color="${this.theme.primaryColor}" offset="1"></stop>
                                        </linearGradient>
                                    </defs>
                                    <rect width="100" height="100" fill="url(#linearGradient850)" stroke-linejoin="round" stroke-width="2.1354"></rect>
                                </svg>
                            </slot>
                        </div>
                        <div style="width: 100%;height: 60px;">
                            <lay-them in="row" ma="flex-start" ca="stretch">
                                <div style="width: 50px;">
                                    <lay-them ma="center" ca="center"><ut-scaffold-menu-button></ut-scaffold-menu-button></lay-them>
                                </div>        
                                <div style="flex:1;">
                                    <slot name="title"></slot>
                                </div>
                            </lay-them>
                        </div>
                    </lay-them>
                </div>
                <div class="body" style="flex: 1 1 auto; overflow-y: auto;">
                    <slot name="body"></slot>
                </div>
            </lay-them>
        </div>
        <div class="expanded glass" style="z-index: 10000;backdrop-filter: blur(4px);display: ${(()=>{
            if(state.showMenu){
                return "block";
            }else{
                return "none";
            }
        })()};">
            <lay-them in="row" ca="stretch" ma="flex-start">
                <div style="background-color: white; flex: 2 1 auto; max-width: 250px; box-shadow: ${this.theme.scaffold_menu_shadow};">
                    <slot name="menu"></slot>
                </div>
                <div style="flex: 1 1 auto;" @click=${this.toggleMenuBar}></div>
            </lay-them>
        </div>
        <div class="snack-bar" style="border-radius: ${this.theme.cornerRadius}; display: ${(()=>{
            if(state.showSnackbar){
                return "block";
            }else{
                return "none";
            }
        })()};">
            <div style="color:white;">${state.snackBarMessage}</div>
        </div>
    </lay-them>
</div>
        `;
    }

}

customElements.define("ut-scaffold", ScaffoldBuilder);

class MenuButton extends WidgetBuilder<ScaffoldBloc, ScaffoldState>{
    constructor() {
        super("ScaffoldBloc");
    }

    toggleMenuBar=()=>{
        setTimeout(()=>{this.bloc?.toggleMenu(true);},300);
        //@ts-ignore
        this.shadowRoot.querySelector("#animateTransform5322").beginElement();
    }

    builder(state: ScaffoldState): TemplateResult {
        return html`<svg
        style="fill:${this.theme.scaffold_menu_icon_color};"
        width="10mm"
        height="10mm"
        viewBox="0 0 25 25"
        version="1.1"
        id="svg845"
        preserveAspectRatio="xMidYMid"
        anigen:version="0.8.1"
        @click=${this.toggleMenuBar}>
        <g
            id="icon"
            transform="translate(-1.5748032e-7,1.4999999)"
            onclick="">
            <rect
            style="stroke-width:1.92378;stroke-linejoin:round;stroke-opacity:0.658819"
            id="rect835"
            width="15"
            height="2"
            x="5"
            y="5" />
            <rect
            style="stroke-width:1.92378;stroke-linejoin:round;stroke-opacity:0.658819"
            id="rect837"
            width="15"
            height="2"
            x="5"
            y="10" />
            <rect
            style="stroke-width:1.92378;stroke-linejoin:round;stroke-opacity:0.658819"
            id="rect839"
            width="15"
            height="2"
            x="5"
            y="15" />
            <animateTransform
            attributeName="transform"
            attributeType="auto"
            type="rotate"
            values="0 12.50589307470144 10.997459956419888;180 12.50589307470144 10.997459956419888"
            calcMode="spline"
            keyTimes="0;1"
            keySplines="0 0 1 1"
            dur="0.3s"
            begin="indefinite"
            repeatCount="1"
            additive="sum"
            accumulate="none"
            fill="freeze"
            id="animateTransform5322" />
        </g>
        </svg>`;
    }
}

customElements.define("ut-scaffold-menu-button", MenuButton);