
import { TemplateResult, html, ListenerWidget } from 'bloc-them';

export class Expanded extends ListenerWidget{
    constructor(){
        super();
    }
    build(state: number): TemplateResult {
        return html`<div style="width:100%; height: 100%;"><slot></slot></div>`;
    }
}

customElements.define("ut-ex",Expanded);