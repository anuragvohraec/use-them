import { Bloc, BlocsProvider } from "bloc-them";
import { html, TemplateResult } from 'lit-html';
import { WidgetBuilder } from '../utils/blocs';
import { I18NBloc } from "./text";

interface SnackBarMessage{
    msg: string;
    color?:string;
    background_color?:string;
}

export class SnackBarBloc extends Bloc<SnackBarMessage|undefined>{
    protected _name: string="SnackBarBloc";

    private current_timeout?: NodeJS.Timeout;
    constructor(private default_color="white", private default_background_color="#000000b3"){
        super(undefined);
    }

    postMessage(newMessage:SnackBarMessage, timeout_ms:number=4000){
        if(newMessage){
            this.emit({msg:newMessage.msg, color:newMessage.color||this.default_color,  background_color:newMessage.background_color||this.default_background_color});
            if(this.current_timeout){
                clearTimeout(this.current_timeout);
            }
            this.current_timeout = setTimeout(()=>{
                this.emit(undefined);
            },timeout_ms);
        }
    }
} 

class Snackbar extends WidgetBuilder<SnackBarBloc,SnackBarMessage|undefined>{
    private i18nBloc?: I18NBloc;

    connectedCallback(){
        super.connectedCallback();
        setTimeout(()=>{
            if(!this.i18nBloc){
                this.i18nBloc = BlocsProvider.search("I18NBloc",this);
            }
        })
    }
    builder(state: SnackBarMessage|undefined): TemplateResult {
        let msg = state?.msg;
        if(this.i18nBloc && state?.msg){
            let t = this.i18nBloc.getText(state?.msg);
            if(t){
                msg=t;
            }
        }
        return !state? html``:html`
        <style>
            .snack-bar{
                background-color: ${state.background_color};
                padding:10px 20px; 
                color: ${state.color};
                border-radius: ${this.theme.cornerRadius};
            }
        </style>
        <div class="snack-bar"><div style="color:${state.color}">${msg}</div></div>
        `;
    }

    constructor(){
        super("SnackBarBloc");
    }
}
customElements.get("snack-bar")||customElements.define("snack-bar",Snackbar);
