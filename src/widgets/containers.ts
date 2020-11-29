import { WidgetBuilder, BogusBloc } from "../utils/blocs";
import { TemplateResult, html } from 'lit-html';

export class Expanded extends WidgetBuilder<BogusBloc,number>{
    constructor(){
        super(BogusBloc, {
            useThisBloc: new BogusBloc()
        });
    }
    builder(state: number): TemplateResult {
        return html`<div style="width:100%; height: 100%;"></div>`;
    }
}

customElements.define("ut-ex",Expanded);