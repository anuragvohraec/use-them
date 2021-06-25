import { Bloc } from "bloc-them";
import { html, TemplateResult } from 'lit-html';
import { WidgetBuilder } from '../utils/blocs';

/**
 * Can be use to hide values between true and false;
 * default init state is true;
 */
export class HideBloc extends Bloc<boolean>{
    protected _name: string="HideBloc";

    constructor(initState:boolean=true){
        super(initState);
    }

    toggle(){
        this.emit(!this.state);
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
        }
        </style><div class="fullscreenGlass" @click=${(e:Event)=>{  
            e.stopPropagation();
            return false;
        }}><slot></slot></div>`;
    }
}

customElements.define("ut-dialogue", Dialogue);