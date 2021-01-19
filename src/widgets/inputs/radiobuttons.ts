import { Bloc,BlocsProvider } from "bloc-them";
import { html, TemplateResult } from "lit-html";
import { WidgetBuilder } from '../../utils/blocs';
import { FormBloc, FormMessageBloc, FormState,FormMessageState } from "../forms";

/**
 * key for this used as Value and value is used as Label for radioButtons
 */
interface RadioButtonValueLabelMap{
    [key:string]:string;
}

export class RadioButtonsBuilder<F extends FormBloc> extends WidgetBuilder<F,FormState>{
    private name:string;
    constructor(formBlocName:string, private valueLabelMap: RadioButtonValueLabelMap){
        super(formBlocName);
        let n = this.getAttribute("name");
        if(!n){
            throw `Radio buttons do not have a name attribute!`;
        }else{
            this.name = n;
        }
    }

    
    onChange=(e:Event)=>{
        //@ts-ignore
        const t:HTMLElement = e.target;
        const v = t.getAttribute("value");
        this.bloc?.delegateChangeTo(this.name,v,BlocsProvider.of<FormMessageBloc,FormMessageState>("FormMessageBloc",t)!);
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
                        <div class="radio ${state[this.name]===v?"active":"inactive"}" @click=${this.onChange} value="${v}"></div>
                        <ut-p>${this.valueLabelMap[v]}</ut-p>
                    </lay-them>
                </div>
                `;
            })}
        </lay-them>
        `;
    }
}