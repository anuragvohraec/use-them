import { FormInputBuilder, FormBloc, FormState } from '../forms';
import { TemplateResult, html } from 'lit-html';
import { BlocType, BlocsProvider } from 'bloc-them';
import '@polymer/iron-icons';
import { I18NBloc } from '../text';
import {ifDefined} from 'lit-html/directives/if-defined';


export class SingleLineInput<F extends FormBloc> extends FormInputBuilder<string,F>{
    builder(state: FormState): TemplateResult {
        return html`
        <style>
            .glass{
                background-color: ${this.theme.input_bg_color};
            }
            .sli-bg{
                width: 100%;
                min-height: ${this.theme.input_height};
                border-radius: ${this.theme.cornerRadius}
            }

            input{
                background: transparent;
                border: none;
                font-size: 1em;
                caret-color: ${this.theme.input_cursor_color};
                color: ${this.theme.input_text_color};
                padding: ${this.theme.input_padding};
                -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
                -moz-box-sizing: border-box;    /* Firefox, other Gecko */
                box-sizing: border-box;
                font-weight: ${this.theme.input_font_weight};
            }
            input:focus{
                outline-width: 0;
            }
            input::placeholder{
                color: ${this.theme.input_place_holder_color};
            }
            .iconCtrl{
                --iron-icon-height: 30px;
                --iron-icon-width: 30px;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                padding-left: 5px;
            }
        </style>
        ${this.getDataList()}
        <div class="sli-bg glass">
            <lay-them in="row">
                ${this.getIcon()}
                <div style="flex: 1">
                    <input ?disabled=${this.disabled} @input=${this._delegateChange} list="${ifDefined(this.dataList)}"  inputmode="${this.getInputMode()}" value="${ifDefined(this.getValue())}" class="sli-bg" placeholder="${this.getPlaceHolder()}" type="${this.getInputType()}">
                </div>
            </lay-them>
        </div>
        `;
    }
    
    public get dataList() : string|undefined {
        if(this.valueList){
            return "dataList";
        }
    }
    
    _delegateChange=(e: InputEvent)=>{
        this.onChange!((e.target as HTMLInputElement).value);
    }

    getInputMode=()=>{
        let inputmode = this.getAttribute("inputmode");
        if(inputmode){
            return inputmode;
        }else{
            return "text";
        }
    }

    getDataList=()=>{
        if(this.valueList){
            return html`
<datalist id="dataList">
    ${this.valueList.map(i=>html`<option value="${i}">`)}
</datalist>
        `;
        }
    }

    getIcon= ()=>{
        let icon = this.getAttribute("icon");
        if(icon){
            return html`<div class="iconCtrl"><iron-icon icon="${icon}" style="fill: ${this.theme.input_icon_color};"></iron-icon></div>`;
        }
    }

    getValue =(): string|undefined=>{
        let value = this.getAttribute("value");
        if(value){
            return value;
        }
    }

    getPlaceHolder= (): string=>{
        let placeholder = this.getAttribute("placeholder");
        if(placeholder){
            if(this._i18n){
                let t = this._i18n.getText(placeholder);
                return t?t:"";
            }else{
                return placeholder;
            }
        }else{
            return "";
        }
    }

    getInputType=():"hidden" | "text" | "search" | "tel" | "url" | "email" | "password" | "datetime" | "date" | "month" | "week" | "time" | "datetime-local" | "number" | "range" | "color" | "checkbox" | "radio" | "file" | "submit" | "image" | "reset" | "button" =>{
        let type=this.getAttribute("type");
        if(type){
            //@ts-ignore
            return type;
        }else{
            return "text";
        }
    }

    private _i18n? : I18NBloc;

    constructor(type: BlocType<F,FormState>, private valueList?: string[]){
        super(type);
        this._i18n = BlocsProvider.of(I18NBloc, this);
    }
}