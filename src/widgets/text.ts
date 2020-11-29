import { Bloc, BlocsProvider, BlocBuilder } from 'bloc-them';
import { TemplateResult , html} from 'lit-html';
import {WidgetBuilder} from '../utils/blocs';

/**
 * Keys must be all in lower case
 */
interface LanguagePack{
    [key: string]: string
}


export class I18NBloc  extends Bloc<LanguagePack>{
    constructor(initState: LanguagePack){
        super(initState);
    }

    changeLanguage(newState: LanguagePack){
        this.emit(newState);
    }
}

export abstract class I18NBlocProvider extends BlocsProvider{
    builder(): TemplateResult {
        return html`<div style="width:100%; height: 100%;"><slot></slot></div>`;
    }
    constructor(initState: LanguagePack){
        super([new I18NBloc(initState)]);
    }
}

export abstract class _I18NText extends WidgetBuilder<I18NBloc,LanguagePack>{
    private _font_size:string = "1em";

    builder(state: LanguagePack): TemplateResult {
        return html`<span style="font-size: ${this._font_size}; color: ${this.theme.color}">${_I18NText._getText(this.textContent,state)}</span>`;
    }

    
    public set font_size(v : string) {
        this._font_size = v;
    }
    
    
    constructor(){
        super(I18NBloc);  
    }

    static _getText(textKey: string|null, state: LanguagePack): string|undefined{
        if(textKey){
            let t = textKey.toLowerCase();
               if(state[t]){
                   return state[t];
               }else{
                   console.log("Text keys not found: ", textKey);
                   return textKey;
               }
        }
    }
}


export class UtTextP extends _I18NText{
    
    constructor(){
        super();
        this.font_size= this.theme.P_font_size;
    }
}

customElements.define("ut-p", UtTextP);

export class UtTextH1 extends _I18NText{
    
    constructor(){
        super();
        this.font_size= this.theme.H1_font_size;
    }
}

customElements.define("ut-h1", UtTextH1);



export class UtTextH2 extends _I18NText{
    
    constructor(){
        super();
        this.font_size= this.theme.H2_font_size;
    }
}

customElements.define("ut-h2", UtTextH2);

export class UtTextH3 extends _I18NText{
    
    constructor(){
        super();
        this.font_size= this.theme.H3_font_size;
    }
}

customElements.define("ut-h3", UtTextH3);


export class UtTextH5 extends _I18NText{
    
    constructor(){
        super();
        this.font_size= this.theme.H5_font_size;
    }
}

customElements.define("ut-h5", UtTextH5);

export class UtTextH6 extends _I18NText{
    
    constructor(){
        super();
        this.font_size= this.theme.H6_font_size;
    }
}

customElements.define("ut-h6", UtTextH6);

