import { html, TemplateResult } from "lit-html";
import { NoBlocWidgetBuilder } from "../utils/blocs";

export class UtIcon extends NoBlocWidgetBuilder{
    
    public get icon() : string {
        let t = this.getAttribute("icon");
        if(t){
            return t;
        }else{
            throw 'use attribute icon must be supplied';
        }
    }

    builder(state: number): TemplateResult {
        
        return html`<style>
        .icon {
            display: inline-block;
            width: ${this.useAttribute?.["size"]??"25px"};
            height: ${this.useAttribute?.["size"]??"25px"};
            fill: ${this.useAttribute?.["fill"]??"#000"};
        }
    </style>
    <!--Icons usage the xlink ref is the id of the icons-->
    <svg viewBox="0 0 24 24" class="icon">
        <use xlink:href='#${this.icon}'></use>
    </svg>
    `;
    }
}
if(!customElements.get("ut-icon")){
    customElements.define("ut-icon",UtIcon);
}