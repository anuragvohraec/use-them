import { Bloc, BlocsProvider} from 'bloc-them';
import { TemplateResult , html, nothing} from 'lit-html';
import {WidgetBuilder} from '../utils/blocs';

/**
 * Keys must be all in lower case
 */
export interface LanguagePack{
    [key: string]: string
}


export class I18NBloc  extends Bloc<LanguagePack>{
    protected _name: string="I18NBloc";

    constructor(initState: LanguagePack){
        super(initState);
    }

    changeLanguage(newState: LanguagePack){
        this.emit(newState);
    }

    getText(textKey: string|null): string|undefined{
        if(textKey){
            let t = textKey.toLowerCase();
            let r= this.state[t];
               if(r){
                   return r;
               }else{
                   return textKey;
               }
        }
    }
}

export abstract class I18NBlocProvider extends BlocsProvider{
    builder(): TemplateResult {
        return html`<div style="width:100%; height: 100%;"><slot></slot></div>`;
    }
    constructor(initState: LanguagePack){
        super({I18NBloc: new I18NBloc(initState)});
    }
}

export abstract class _I18NText extends WidgetBuilder<I18NBloc,LanguagePack>{
    private _font_size:string = "1em";
    private _key?: string | undefined;
    
    public get key(): string | undefined {
        return this._key;
    }

    public set key(value: string | undefined) {
        this._key = value;
        if(this.bloc){
            this._build(this.bloc.state);
        }
    }


    builder(state: LanguagePack): TemplateResult {
        let t = this.key??this.textContent;
        if(!t){
            return nothing as TemplateResult;
        }
        return html`<span style="font-size: ${this._font_size}; color: ${this.color};user-select:${this.style.userSelect?this.style.userSelect:'none'}">${_I18NText._getText(t,state)}</span>`;
    }

    
    public get color() : string {
        let c = this.style.color??this.getAttribute("color");
        return c||this.theme.color;
    }
    
    
    public set font_size(v : string) {
        this._font_size = v;
    }
    
    
    constructor(){
        super("I18NBloc");  
    }

    static _getText(textKey: string|null, state: LanguagePack): string|undefined{
        if(textKey){
            let t = textKey.toLowerCase();
               if(state[t]){
                   return state[t];
               }else{
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


export class UtTextFree extends _I18NText{
    constructor(){
        super();
        this.font_size=this.useAttribute?.["font_size"]??this.theme.P_font_size;
    }
}
customElements.define("ut-txt", UtTextFree);
