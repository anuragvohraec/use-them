import { FormInputBuilder, FormBloc, FormState, InputBuilderConfig } from '../forms';
import { TemplateResult, html } from 'lit-html';
import {  BlocsProvider } from 'bloc-them';
import { I18NBloc } from '../text';
import {ifDefined} from 'lit-html/directives/if-defined';
import { UseThemConfiguration } from '../../configs';

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
                <div style="flex: 1;">
                    <lay-them in="row" ca="center">
                        <input id="sli" @focus=${()=>{navigator.vibrate(UseThemConfiguration.PRESS_VIB);}} ?disabled=${this.disabled} @input=${this.haveChanged} list="${ifDefined(this.dataList)}"  inputmode="${ifDefined(this.config.inputmode)}" .value=${state[this.config.name]??""} class="sli-bg" placeholder="${ifDefined(this.config.placeholder)}" type="${ifDefined(this.config.type)}">
                        ${this.getClearButton()}
                    </lay-them>
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
    
    haveChanged=(e: InputEvent)=>{
        this.hasChanged((e.target as HTMLInputElement).value);
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

    getClearButton = ()=>{
        if(this.config.clearable || this.valueList){
            return html`<div style="padding: 5px;" @click=${this.clearText}><ut-icon icon="clear" use="icon_inactive: ${this.theme.input_icon_color};"></ut-icon></div>`;
        }
    }

    getIcon= ()=>{
        if(this.config.icon){
            return html`<div class="iconCtrl"><ut-icon icon="${this.config.icon}" use="icon_inactive: ${this.theme.input_icon_color};"></ut-icon></div>`;
        }
    }

    clearText= ()=>{
        (this.shadowRoot?.querySelector("#sli") as HTMLInputElement).value="";
        this.hasChanged();
    }


    constructor(config: InputBuilderConfig, private valueList?: string[]){
        super(config);
    }
}


export class TextAreaInput<F extends FormBloc> extends FormInputBuilder<string,F>{
    constructor(config: InputBuilderConfig){
        super(config);
    }
    haveChanged=(e:Event)=>{
        let ctx = e.currentTarget as HTMLInputElement;
        this.hasChanged(ctx.value);
    }

    builder(state: FormState): TemplateResult {
        return html`<textarea placeholder="${ifDefined(this.config.placeholder)}" @focus=${()=>{navigator.vibrate(UseThemConfiguration.PRESS_VIB);}} @keyup=${this.haveChanged} style="padding:10px;outline: none;resize: none;width: 100%;height:100%;box-sizing: border-box; min-height: 100px; background-color: ${this.theme.input_bg_color};border-radius: ${this.theme.cornerRadius};border: none;" type="text">${state[this.config.name]}</textarea>`;
    }

 }