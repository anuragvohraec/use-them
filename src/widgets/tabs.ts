import { findBloc, ListenerWidget } from 'bloc-them';
import { html, render, TemplateResult,repeat } from 'bloc-them';
import { APage, RouteState, RouteThem, RouteThemBloc } from '../widgets/route-them/RouteThem';
import { BogusBloc, WidgetBuilder } from '../utils/blocs';
import { GestureDetector } from './gesturedetector';


class TabRouterBloc extends RouteThemBloc{
    protected _name:string="TabRouterBloc";
    private _number_of_routes:number=0;

    constructor(){
        super();
    }

    define(routePath: string){
        super.define(routePath);
        this._number_of_routes++;
    }

    
    public get number_of_routes() : number {
        return this._number_of_routes
    }
    
    public get current_index():number{
        let t = this.state.url_path;
        if(t === "/"){
            return 0;
        }else{
            return parseInt(t.substring(1));
        }
    }
}

export class TabHeader extends WidgetBuilder<RouteState>{
    private _icon!:string;
    private _indexpath!: string;
    public label!:string;
    
    constructor(){
        super("TabRouterBloc");
    }

    
    public get icon() : string {
        if(!this._icon){
            let t = this.getAttribute("icon")
            if(!t){
                throw `No icon attribute provided for tab header`;
            }else{
                this._icon = t
            }   
        }
        return this._icon;
    }

    
    public get indexpath() : string {
        if(!this._indexpath){
            let t1 = this.getAttribute("indexpath");
            if(!t1){
                throw "no indexpath attribute provided";
            }else{
                this._indexpath = t1;
            }
        }
        return this._indexpath;
    }
    
    

    connectedCallback(){
        super.connectedCallback();
        this.icon;
        this.indexpath;
        render(this.shadowRoot!,this.build(this.bloc<TabRouterBloc>()?.state!));
    }

    build(state: RouteState): TemplateResult {
        return html`
        <style>
            .icon{
                background-color: ${state.url_path === this.indexpath ? "#fafafa": this.theme.tab_inactive_color};
                width: 100%;
                height: 100%;
                flex: 1;
                min-width: 50px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .symbol{
                color: ${state.url_path === this.indexpath ? this.theme.tab_active_icon_color: this.theme.tab_inactive_icon_color};
                font-size: 25px;
            }
        </style>
        <ink-well>
        <div class="icon" @click=${()=>{
            this.bloc<TabRouterBloc>()?.goToPage(this._indexpath,{saveToBrowserHistory:false,title:""})
        }}>
        
            <lay-them  ca="center" ma="center">
                ${this.icon.startsWith("emoji:")?html`<div class="symbol">${this._icon.split(":")[1]}</div>`:html`<ut-icon icon="${this._icon}" use="icon_inactive: ${state.url_path === this.indexpath ? this.theme.tab_active_icon_color: this.theme.tab_inactive_icon_color}"></ut-icon>`}
                ${this.label?html`<ut-h5>${this.label}</ut-h5>`:``}
            </lay-them>    
    </div>
    </ink-well>
        `;
    }
}
customElements.define("ut-tab-header", TabHeader);


class _TabsGestureDetector extends GestureDetector{
    private _routeBloc?: TabRouterBloc;
    constructor(){
        super({
            capture: true
        });
    }

    connectedCallback(){
        super.connectedCallback();
        let t = findBloc<TabRouterBloc>("TabRouterBloc", this);
        if(!t){
            throw `No TabRouterBloc found for gesture detector for tabs`;
        }else{
            this._routeBloc = t;
        }
    }

    onSwipeLeft=()=>{
        if(this._routeBloc){
            let next_index :number;
            if(this._routeBloc.current_index >= this._routeBloc.number_of_routes-1){
                next_index = 0 ;
            }else{
                next_index = this._routeBloc.current_index+1;
            }
            this._routeBloc.goToPage(`/${next_index===0?"":next_index}`,{saveToBrowserHistory:false,title:""});
        }
    }
    
    onSwipeRight=()=>{
        if(this._routeBloc){
            let next_index :number;
            if(this._routeBloc.current_index <= 0){
                next_index = this._routeBloc.number_of_routes-1;
            }else{
                next_index = this._routeBloc.current_index-1;
            }
            this._routeBloc.goToPage(`/${next_index===0?"":next_index}`,{saveToBrowserHistory:false,title:""});
        }
    }
}

customElements.define("tabs-gesture-detector", _TabsGestureDetector);

export class TabController extends WidgetBuilder<number>{
    
    private _headers?: TemplateResult;

    constructor(){
        super("BogusBloc",{
            BogusBloc: new BogusBloc(),
            TabRouterBloc: new TabRouterBloc()
        })
    }

    private getHeaders():TemplateResult{
        if(!this._headers){
            let tabs = this.querySelectorAll("ut-tabs > ut-tab");
            if(tabs.length>0){

                let listOfIcons: any={};
                for(let i=0;i<tabs.length;i++){
                    //listOfIcons.push();
                    let t =tabs[i];
                    let icon = t.getAttribute("icon");
                    let label = t.getAttribute("label");
                    if(!icon){
                        throw "No icon defined for tab index: ${i}";
                    }else{
                        let route = t.getAttribute("route");
                        if(!route){
                            if(i===0){
                                t.setAttribute("route","/");
                            }else{
                                t.setAttribute("route",`/${i}`);
                            }
                        }
                        listOfIcons[icon]={
                            path: (i===0?"/":`/${i}`),
                            label
                        };
                    }
                }
                return html`<lay-them in="row" ma="start" ca="stretch">
                    ${repeat(Object.keys(listOfIcons),i=>i,(e,idx)=>{
                        return html`<div class="icon"><ut-tab-header icon=${e} indexpath="${listOfIcons[e].path}" .label=${listOfIcons[e].label}></ut-tab-header></div>`;
                    })}
                </lay-them>`;
            }else{
                throw `No Tabs defined for tabs controller`;
            }
        }else{
            return this._headers;
        }
    }

    getBody():TemplateResult{
        let t = this.hasAttribute("disableswipe");
        if(t){
            return html`<slot></slot>`;
        }else{
            return html`
            <tabs-gesture-detector>
                <slot></slot>
            </tabs-gesture-detector>`;
        }
    }

    build(state:number): TemplateResult {
        return html`
        <style>
            .headers{
                height: ${this.theme.tab_header_height};
                width: auto;
                margin: ${this.theme.tab_header_margin};
                border-radius: ${this.theme.tab_header_border_radius};
                overflow: ${this.theme.tab_header_overflow};
                box-shadow: ${this.theme.tab_header_bar_shadow};
                z-index: ${this.theme.tab_header_zIndex};
                box-sizing: border-box;
                padding: ${this.theme.tab_header_padding};
            }
            .icon{
                flex: 1;
            }
            .body{
                flex: 1;
                height: 100%;
                overflow-y: scroll;
            }
            .body::-webkit-scrollbar { 
                display: none;  /* Safari and Chrome */
            }
        </style>
        <lay-them  ma="start">
            <div class="headers">
                ${this.getHeaders()}
            </div>
            <div  class="body">
                ${this.getBody()}
            </div>
        </lay-them>
        `;
    }
}

customElements.define("ut-tab-controller", TabController);

export class Tabs extends RouteThem{
    constructor(){
        super("ut-tab","TabRouterBloc");
    }

    build(state: number): TemplateResult {
        return html`<div style="width: 100%; height: 100%;"><slot></slot></div>`;
    }
}
customElements.define("ut-tabs", Tabs);


export class Tab extends APage{
    private index:number =-1;
    constructor(){
        super("TabRouterBloc");
        //lets set route attribute for the index mentioned.
        let t = this.getAttribute("index");
        if(!t){
            throw `No attribute index attribute given on the tab`;
        }else{
            this.index = parseInt(t);
            let r = t==="0"?"/":`/${t}`;
            this.setAttribute("route",r);
        }
    }

    _getBaseTemplate(doHide: boolean): TemplateResult{
        return html`
        <style>
          .hide{
            display: none;
          }
          .show{
            display: block;
          }
          .expanded{
              width: 100%;
              height: 100%;
          }
        </style>
        <div class="expanded ${doHide?'hide':'show'}">
        <slot></slot>
        </div>
        `; 
    }

}
customElements.define("ut-tab", Tab);
    