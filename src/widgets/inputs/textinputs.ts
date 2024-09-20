import { FormInputBuilder, FormBloc, FormState, InputBuilderConfig } from '../forms';
import { TemplateResult, html, findBloc } from 'bloc-them';

import { I18NBloc } from '../text';
import { UseThemConfiguration } from '../../configs';
import { HideBloc } from '../dialogues';

export class SingleLineInput<F extends FormBloc> extends FormInputBuilder<string,F>{
    build(state: FormState): TemplateResult {
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
                <div style="flex: 1;" @click=${this.handleOnClick}>
                    <lay-them in="row" ca="center">
                        <input id="sli" @focus=${()=>{navigator.vibrate(UseThemConfiguration.PRESS_VIB);}} ?required=${this.config.required} ?autocomplete=${this.config.autocomplete} ?disabled=${this.disabled} @input=${this.haveChanged} ?list=${this.dataList}  ?inputmode=${this.config.inputmode} .value=${state[this.config.name]??""} class="sli-bg" ?placeholder=${this.config.placeholder} ?type=${this.config.type}>
                        ${this.getClearButton()}
                    </lay-them>
                </div>
                ${this.getPopupButton()}
            </lay-them>
        </div>
        `;
    }

    private getPopupButton(){
        if(this.config.popupConfig?.additonal_button){
            let color=this.theme.primaryColor;
            if(this.disabled){
                color=this.theme.input_bg_color;
            }
            
            let style=`width:${this.theme.input_height};height:${this.theme.input_height};background-color:${color};border-radius: 0px ${this.theme.cornerRadius} ${this.theme.cornerRadius} 0px;`;
            return html`<div style=${style}>
            <ink-well @click=${(e:Event)=>{
                if(!this.disabled){
                    if(this.config.popupConfig?.additonal_button?.actionOnClick){
                        this.config.popupConfig?.additonal_button?.actionOnClick(this);
                    }else{
                        if(this.config.popupConfig){
                            findBloc<HideBloc>(this.config.popupConfig.hide_bloc_name,this)?.show();
                        }
                    }
                }
            }}>
                <ut-icon icon=${this.config.popupConfig.additonal_button.icon??"search"} use="icon_inactive:white;"></ut-icon>
            </ink-well>
            </div>`;
        }
    }

    private handleOnClick=(e:Event)=>{
        if(this.config.popupConfig){
            findBloc<HideBloc>(this.config.popupConfig.hide_bloc_name,this)?.show();
        }
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
        if(!this.disabled && (this.config.clearable || this.valueList)){
            return html`<div style="padding: 5px;" @click=${this.clearText}><ut-icon icon="clear" use="icon_inactive: ${this.theme.input_icon_color};"></ut-icon></div>`;
        }else{
            return html``;
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

    build(state: FormState): TemplateResult {
        setTimeout(()=>{
            let t = this.shadowRoot?.querySelector("textarea");
            if(t){
                t.value=state[this.config.name]??"";
            }
        });
        return html`<textarea ?disabled=${this.disabled} ?placeholder=${this.config.placeholder} @focus=${()=>{navigator.vibrate(UseThemConfiguration.PRESS_VIB);}} @keyup=${this.haveChanged} style="padding:10px;outline: none;resize: none;width: 100%;height:100%;box-sizing: border-box; min-height: 100px; background-color: ${this.theme.input_bg_color};border-radius: ${this.theme.cornerRadius};border: none;" type="text"></textarea>`;
    }

 }