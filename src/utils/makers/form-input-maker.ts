import {RadioButtonsBuilder, RadioButtonValueLabelMap} from '../../widgets/inputs/radiobuttons';
import { SingleLineInput, TextAreaInput } from '../../widgets/inputs/textinputs';
import { CheckBox } from '../../widgets/inputs/checkbox';
import { DatePicker, DatePickerConfig } from '../../widgets/inputs/date-picker';
import { RangeSelector } from '../../widgets/inputs/rangeselector';
import { repeat } from 'lit-html/directives/repeat';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { InputBuilderConfig } from '../../widgets/forms';
import { html,  nothing,  TemplateResult } from 'lit-html';
import { BlocsProvider } from 'bloc-them';
import { ToggleButton } from '../../widgets/inputs/togglebutton';

export interface InputInfo{
    type:"SingleLineInput"|"TextAreaInput"|"CheckBox"|"DatePicker"|"RadioButtons"|"RangeSelector"|"ToggleButton"|"Popup";
    config: InputBuilderConfig;
    input_init_values?: string[]|RadioButtonValueLabelMap|string|DatePickerConfig;
    label?:string;
    input_info_msg?:string
}


export class FormInputMaker extends BlocsProvider{
    private nameList!:string[];
    private tags_list:Record<string,string>={};

    constructor(private config:{ formBloc_name:string,tag_prefix:string, inputs:Record<string,InputInfo>}){
        super({});
        this.defineTags();
    }

    private convertNameToInputTagName(nameOfInput:string){
        return `${this.config.tag_prefix}-${nameOfInput.toLowerCase()}-input`;
    }

    private defineTags(){
        this.nameList = Object.keys(this.config.inputs);
        for(let nameOfInput of this.nameList){
            let tag_name = this.convertNameToInputTagName(nameOfInput);
            let inputInfo:InputInfo = this.config.inputs[nameOfInput];
            switch (inputInfo.type) {
                case "Popup":{
                    class A extends SingleLineInput<any>{
                        constructor(){
                            super(inputInfo.config);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                }break;
                case "SingleLineInput": {
                    class A extends SingleLineInput<any>{
                        constructor(){
                            super(inputInfo.config, inputInfo.input_init_values as string[]);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                    break;
                }
                case "TextAreaInput": {
                    class A extends TextAreaInput<any>{
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
                    class A extends CheckBox<any>{
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
                    class A extends DatePicker<any>{
                        constructor(){
                            super(inputInfo.config, inputInfo.input_init_values as DatePickerConfig);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                    break;
                }
                case "RadioButtons": {
                    class A extends RadioButtonsBuilder<any>{
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
                    class A extends RangeSelector<any>{
                        constructor(){
                            super(inputInfo.config);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                    break;
                }
                case "ToggleButton":{
                    class A extends ToggleButton<any>{
                        constructor(){
                            super(inputInfo.config);
                        }
                    }
                    if(!customElements.get(tag_name)){
                        customElements.define(tag_name,A);
                    }
                }break;
            }
            this.tags_list[nameOfInput]=tag_name;
        }
     }


    builder(): TemplateResult {
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
            label{
                color: var(--label-color,#000);
                user-select:none;
            }
        </style>
        ${repeat(this.nameList,(item)=>item,(name,index)=>{
            return html`
            <div class="input">
                ${this.config.inputs[name].label?html`<label for=${name}><ut-h5 .key=${this.config.inputs[name].label} use="color:var(--label-color,#000);"></ut-h5> : <ut-h5 use="color:var(--input-info-msg-color,#8a8a8a);" .key=${this.config.inputs[name].input_info_msg}></ut-h5></label>`:nothing}
                ${unsafeHTML(`<${this.tags_list[name]}></${this.tags_list[name]}>`)}
                <div class="input-msg"><form-message for=${name}></form-message></div>
            </div>
            `;
        })}
        `;
    }
 }