import { html, TemplateResult } from "lit-html";
import { unsafeSVG } from "lit-html/directives/unsafe-svg";
import { BogusBloc, WidgetBuilder } from "../utils/blocs";

export class UtIcon extends WidgetBuilder<BogusBloc,number>{
    
    public get icon() : string {
        let t = this.getAttribute("icon");
        if(t){
            return t;
        }else{
            throw 'use attribute icon must be supplied';
        }
    }

    constructor(){
        super("BogusBloc",{
            blocs_map:{
                BogusBloc: new BogusBloc()
            }
        })
    }


    builder(state: number): TemplateResult {
        return html`<style>
        .icon {
            display: inline-block;
            width: ${this.theme.icon_size??"25px"};
            height: ${this.theme.icon_size??"25px"};
            fill: ${this.theme.icon_inactive??"#000"};
        }
        .icon:active{
            fill: ${this.theme.icon_active??"#000"};
        }
        .cont1{
            display: inline-block;
            width: 100%;
            height: 100%;
        }
        .cont2{
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    </style>
    <!--Icons usage the xlink ref is the id of the icons-->
    <div class="cont1">
        <div class="cont2">
            <svg viewBox="0 0 24 24" class="icon">
                ${(unsafeSVG(document.querySelector("#"+this.icon)?.innerHTML??'<g id="warning"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></g>'))}
            </svg>
        </div>
    </div>`;
    }
}
if(!customElements.get("ut-icon")){
    customElements.define("ut-icon",UtIcon);
}