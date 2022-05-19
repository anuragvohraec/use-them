import { Bloc } from "bloc-them";
import { html, TemplateResult } from 'lit-html';
import { WidgetBuilder } from '../utils/blocs';
import { OverlayPageBloc, OverlayStatus } from "./route-them/overlays";
import { AppPageBloc } from "./route-them/RouteThem";

/**
 * Can be use to hide values between true and false;
 * default init state is true;
 */
export class HideBloc extends Bloc<boolean>{
    protected _name: string="HideBloc";

    private _data: any;
    public get data(): any {
        return this._data;
    }
    public set data(value: any) {
        this._data = value;
    }

    constructor(initState:boolean=true,private overlay_id?:string){
        super(initState);
    }

    toggle(){
        if(this.overlay_id){
            if(this.state){
                this.emit(false);
                AppPageBloc.search<AppPageBloc>("AppPageBloc",this.hostElement)?.pushOverlayStack(this.overlay_id);
            }else{
                AppPageBloc.search<AppPageBloc>("AppPageBloc",this.hostElement)?.popOutOfCurrentPage();
            }
        }else{
            this.emit(!this.state);
        }
    }

    isHidden(){
        return this.state;
    }

    isShowing(){
        return !this.state;
    }

    show(){
        if(this.overlay_id){
            //if its hidden
            if(this.state){
                this.emit(false);
                AppPageBloc.search<AppPageBloc>("AppPageBloc",this.hostElement)?.pushOverlayStack(this.overlay_id);
            }
        }else{
            this.emit(false);
        }
    }

    hide(){
        if(this.overlay_id){
            //if its showing
            if(!this.state){
                AppPageBloc.search<AppPageBloc>("AppPageBloc",this.hostElement)?.popOutOfCurrentPage();
            }
        }else{
            this.emit(true);
        }
    }

    isTrue(){
        return this.state;
    }

    ifNotTrue(){
        return !this.state;
    }

    setTrue(){
        this.hide();
    }

    setFalse(){
        this.show();
    }


    private overlayPageBloc?:OverlayPageBloc;
    private overlayPageBlocListenerId?:string;


    onConnection(ctx:HTMLElement){
        super.onConnection(ctx);
        if(this.overlay_id){
            //listen for OverlayBloc events
            this.overlayPageBloc = OverlayPageBloc.search<OverlayPageBloc>("OverlayPageBloc",ctx);
            if(this.overlayPageBloc){
                let t:any =(newState:OverlayStatus)=>{
                    if(newState && newState.overlay_id === this.overlay_id && !newState.show){
                        if(!this.state){
                            this.emit(true);
                        }
                    }
                };
                t._ln_name=this._name;
                this.overlayPageBlocListenerId = this.overlayPageBloc._subscribe(t);
            }
        }
    }

    onDisconnection(){
        //stop listening to overlay bloc events
        if(this.overlay_id && this.overlayPageBloc && this.overlayPageBlocListenerId){
            this.overlayPageBloc._unsubscribe(this.overlayPageBlocListenerId);
        }
        super.onDisconnection();
    }

}

/**
 * Using a "blank" attribute would make an empty element
 */
export class Dialogue extends WidgetBuilder<HideBloc,boolean>{
    constructor(blocname?:string){
        super(blocname??"HideBloc");
    }

    builder(state: boolean): TemplateResult {
        if(state && this.hasAttribute("blank")){
            return html``;
        }
        const display = state?"none":"block";
        return html`<style>
        .fullscreenGlass{
            position:fixed;
            width:100%;
            height: 100%;
            background-color: ${this.theme.dialogue_bg};
            display: ${display};
            z-index: 10;
            top: 0;
            left: 0;
            backdrop-filter: blur(4px);
        }
        </style><div class="fullscreenGlass" @click=${(e:Event)=>{  
            e.stopPropagation();
            return false;
        }}><slot></slot></div>`;
    }
}

customElements.define("ut-dialogue", Dialogue);