import { BlocsProvider } from 'bloc-them';
import { html, render, TemplateResult } from 'lit-html';
import { APage, RouteState, RouteThem, RouteThemBloc } from 'route-them';
import { WidgetBuilder } from '../utils/blocs';


export class TabHeader extends WidgetBuilder<RouteThemBloc, RouteState>{
    private _icon!:string;
    private _indexpath!: string;
    
    constructor(){
        super(RouteThemBloc);
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
        render(this.builder(this.bloc?.state!),this.shadowRoot!);
    }

    builder(state: RouteState): TemplateResult {
        return html`
        <style>
            .icon{
                background-color: ${state.url_path === this.indexpath ? "#fafafa": this.theme.tab_inactive_color};
                width: 100%;
                height: 100%;
                flex: 1;
                min-width: 200px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                --iron-icon-height: 80px;
                --iron-icon-width: 80px;
            }
        </style>
        <div class="icon" @click=${()=>{
            this.bloc?.goToPage(this._indexpath,{saveToBrowserHistory:false,title:""})
        }}><iron-icon icon="${this._icon}"></iron-icon></div>
        `;
    }
}
customElements.define("ut-tab-header", TabHeader);

export class TabController extends BlocsProvider{
    
    private _headers?: TemplateResult;

    constructor(){
        super([new RouteThemBloc()])
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
                    if(!icon){
                        throw "No icon defined for tab index: ${i}";
                    }else{
                        let route = t.getAttribute("route");
                        if(!route){
                            throw "No route attribute present";
                        }
                        listOfIcons[icon]=(i===0?"/":`/${i}`);
                    }
                }
                return html`<lay-them in="row">
                    ${Object.keys(listOfIcons).map(e=>html`<div class="icon"><ut-tab-header icon=${e} indexpath="${listOfIcons[e]}"></ut-tab-header></div>`)}
                </lay-them>`;
            }else{
                throw `No Tabs defined for tabs controller`;
            }
        }else{
            return this._headers;
        }
    }

    builder(): TemplateResult {
        return html`
        <style>
            .headers{
                height: 150px;
                width: 100%;
            }
            .icon{
                flex: 1;
            }
        </style>
        <lay-them  ma="start">
            <div class="headers">
                ${this.getHeaders()}
            </div>
            <div  class="body" style="flex: 1;">
                <slot></slot>
            </div>
        </lay-them>
        `;
    }
}

customElements.define("ut-tab-controller", TabController);

export class Tabs extends RouteThem{
    constructor(){
        super("ut-tab");
    }

    builder(){
        return html`<div style="width: 100%; height: 100%;"><slot></slot></div>`;
    }
}
customElements.define("ut-tabs", Tabs);


export class Tab extends APage{
    constructor(){
        super();
        //lets set route attribute for the index mentioned.
        let t = this.getAttribute("index");
        if(!t){
            throw `No attribute index attribute given on the tab`;
        }else{
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
    