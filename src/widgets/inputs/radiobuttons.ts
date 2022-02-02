import { BlocsProvider } from "bloc-them";
import { html, TemplateResult } from "lit-html";
import { UseThemConfiguration } from "../../configs";
import { WidgetBuilder } from '../../utils/blocs';
import { FormBloc, FormInputBuilder, FormMessageBloc, FormState, InputBuilderConfig } from "../forms";

/**
 * key for this used as Value and value is used as Label for radioButtons
 */
export interface RadioButtonValueLabelMap{
    [key:string]:string;
}

export class RadioButtonsBuilder<F extends FormBloc> extends FormInputBuilder<string,F>{

    constructor(config:InputBuilderConfig, private valueLabelMap: RadioButtonValueLabelMap){
        super(config);
    }

    
    onChange=(e:Event)=>{
        navigator.vibrate(UseThemConfiguration.PRESS_VIB);
        //@ts-ignore
        const t:HTMLElement = e.target;
        const v = t.getAttribute("value");
        this.bloc?.delegateChangeTo(this.config.name,v,FormMessageBloc.search<FormMessageBloc>("FormMessageBloc",t)!);
    }

    
    public get color() : string {
        return this.useAttribute?.["color"]||this.theme.input_radio_button_active_color;
    }
    

    builder(state: FormState): TemplateResult {
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
        <lay-them ma="flex-start" ca="stretch">
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