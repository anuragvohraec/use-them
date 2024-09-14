
import { findBloc, html, TemplateResult } from 'bloc-them';
import { UseThemConfiguration } from "../../configs";

import { FormBloc, FormInputBuilder, FormMessageBloc, FormState, InputBuilderConfig } from "../forms";

/**
 * key for this used as Value and value is used as Label for radioButtons
 */
export interface RadioButtonValueLabelMap{
    [key:string]:string;
}

export class RadioButtonsBuilder<F extends FormBloc> extends FormInputBuilder<string,F>{
    protected isDisabled:boolean = false;
    private ly="column";
    constructor(config:InputBuilderConfig, private valueLabelMap: RadioButtonValueLabelMap){
        super(config);
    }

    
    onChange=(e:Event)=>{
        if(!this.disabled){
            navigator.vibrate(UseThemConfiguration.PRESS_VIB);
            //@ts-ignore
            const t:HTMLElement = e.target;
            const v = t.getAttribute("value");
            this.bloc<F>()?.delegateChangeTo(this.config.name,v,findBloc<FormMessageBloc>("FormMessageBloc",t)!);
        }
    }

    
    public get color() : string {
        return this.useAttribute?.["color"]||this.theme.input_radio_button_active_color;
    }

    setInRow(){
        this.ly="row";
        this.rebuild(this.bloc().state);
    }
    

    build(state: FormState): TemplateResult {
        if(state.areDisabled && state.areDisabled.has(this.config.name)){
            this.isDisabled=true;
        }
        return html`
        <style>
            .active{
                background-color:${this.color};
            }
            .inactive{
                background-color:${this.theme.input_bg_color};
            }
            .radio{
                width:25px;
                height:25px;
                margin-right: 5px;
            }
        </style>
        <lay-them .in=${this.ly} ma="flex-start" ca="stretch">
            ${Object.keys(this.valueLabelMap).map(v=>{
                return html`
                <div style="padding: 5px;" @click=${this.onChange} value="${v}">
                    <lay-them in="row" ma="flex-start" ca="center">
                        <div class="radio ${state[this.config.name]===v?"active":"inactive"}" @click=${this.onChange} value="${v}"></div>
                        <ut-p>${this.valueLabelMap[v]}</ut-p>
                    </lay-them>
                </div>
                `;
            })}
        </lay-them>
        `;
    }
}