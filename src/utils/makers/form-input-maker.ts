import {RadioButtonsBuilder, RadioButtonValueLabelMap} from '../../widgets/inputs/radiobuttons';
import { SingleLineInput, TextAreaInput } from '../../widgets/inputs/textinputs';
import { CheckBox } from '../../widgets/inputs/checkbox';
import { DatePicker, DatePickerConfig } from '../../widgets/inputs/date-picker';
import { RangeSelector } from '../../widgets/inputs/rangeselector';
import { repeat } from 'lit-html/directives/repeat';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { FormBloc, FormState, InputBuilderConfig } from '../../widgets/forms';
import { html, TemplateResult } from 'lit-html';

export interface InputInfo{
    type:"SingleLineInput"|"TextAreaInput"|"CheckBox"|"DatePicker"|"RadioButtons"|"RangeSelector"|"ToggleButton";
    config: InputBuilderConfig;
    input_init_values?: string[]|RadioButtonValueLabelMap|string|DatePickerConfig;
    label?:string;
    input_info_msg?:string
}

export class FormInputMaker{
     static create<F extends FormBloc>(config:{tag_prefix:string, inputs:Record<string,InputInfo>},state:FormState):TemplateResult{
        let tags_list:Record<string,string>={};
        for(let nameOfInput of Object.keys(config.inputs)){
            let tag_name = `${config.tag_prefix}-${nameOfInput.toLowerCase()}-input`;
            let inputInfo:InputInfo = config.inputs[nameOfInput];
            switch (inputInfo.type) {
                case "SingleLineInput": {
                    class A extends SingleLineInput<F>{
                        constructor(){
                            super(inputInfo.config);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                    break;
                }
                case "TextAreaInput": {
                    class A extends TextAreaInput<F>{
                        constructor(){
                            super(inputInfo.config);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                    break;
                }
                case "CheckBox": {
                    class A extends CheckBox<F>{
                        constructor(){
                            super(inputInfo.config,inputInfo.input_init_values as string);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                    break;
                }
                case "DatePicker": {
                    class A extends DatePicker{
                        constructor(){
                            super(inputInfo.input_init_values as DatePickerConfig);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                    break;
                }
                case "RadioButtons": {
                    class A extends RadioButtonsBuilder<F>{
                        constructor(){
                            super(inputInfo.config,inputInfo.input_init_values as RadioButtonValueLabelMap);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                    break;
                }
                case "RangeSelector": {
                    class A extends RangeSelector<F>{
                        constructor(){
                            super(inputInfo.config);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                    break;
                }
            }
            tags_list[nameOfInput]=tag_name;
        }

        let namesList = Object.keys(config.inputs);

        return html`
        <style>
            .input{
                padding: 10px 10px 0px 10px;
            }
            .button{
                padding: 20px 10px;
            }
            .input-msg{
                font-size: 0.8em; 
                color: red;
            }
        </style>
        ${repeat(namesList,(item)=>item,(name,index)=>{
            return html`
            <div class="input">
                <label for=${name}><ut-h5 .key=${config.inputs[name].label}></ut-h5> : <ut-h5 use="color:#8a8a8a;" .key=${config.inputs[name].input_info_msg}></ut-h5></label>
                ${unsafeHTML(`<${tags_list[name]} value=${state?.[name]}></${tags_list[name]}>`)}
                <div class="input-msg"><form-message for=${name}></form-message></div>
            </div>
            `;
        })}
        `;
     }
 }