/**
 * Inputs must be unware of form existense.
 */

import { Bloc, BlocsProvider } from 'bloc-them'
import { WidgetBuilder } from '../utils/blocs';
import { TemplateResult, html } from 'lit-html';
import {RadioButtonsBuilder, RadioButtonValueLabelMap} from './inputs/radiobuttons';
import { SnackBarBloc } from './snackbar-messaging';
import { SingleLineInput, TextAreaInput } from './inputs/textinputs';
import { CheckBox } from './inputs/checkbox';
import { DatePicker, DatePickerConfig } from './inputs/date-picker';
import { RangeSelector } from './inputs/rangeselector';
import { repeat } from 'lit-html/directives/repeat';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

 export interface FormState{
     [key:string]:any;
     /**
      * An entry in this set will disable this element
      */
     areDisabled?:Set<string>
 }

 /**
  * if it returns a string that means validation has failed.
  */
 export interface ValidatorFunction<V>{
     (currentValue: V):string|undefined;
 }

 export interface OnChangeFunction<V>{
     (currentValue?:V):void;
 }

 /**
  * Is run after validation, along with validation result.
  */
 export interface PostValidationOnChangeFunction<V>{
    (currentValue:V, validation:string|undefined):void;
 }


 export interface FormMessageState{
     [key:string]: string;
 }

 export class FormMessageBloc extends Bloc<FormMessageState>{
     protected _name: string="FormMessageBloc";
     constructor(){
         super({});
     }

     postMessage(nameOfInput: string, msg: string){
         this.state[nameOfInput]=msg;
         this.emit({...this.state});
     }
 }

 export abstract class FormBloc extends Bloc<FormState>{

    constructor(initState: FormState){
        super(initState);
    }

    disableAnInput(nameOfInput: string){
        if(!this.state.areDisabled){
            this.state.areDisabled= new Set<string>();
        }
        this.state.areDisabled.add(nameOfInput);
        this.emit({...this.state});
    }

    enableAnInput(nameOfInput: string){
        if(this.state.areDisabled){
            this.state.areDisabled.delete(nameOfInput);
        }
        this.emit({...this.state});
    }

    isDisabled(nameOfInput: string): boolean{
        if(this.state.areDisabled){
            return this.state.areDisabled.has(nameOfInput);
        }else{
            return false;
        }
    }

    _basicOnChange(nameOfInput:string):OnChangeFunction<any>|undefined{
        return (newValue: any)=>{
            if(!newValue){
                let t = {...this.state};
                delete  t[nameOfInput];
            }else{
                this.state[nameOfInput]=newValue;
                this.emit({...this.state});
            }
        }
    }

    /**
     * Can be used by non FormInputBuilder elements to update state of form
     * @param nameOfInput 
     */
    delegateChangeTo(nameOfInput:string,currentValue:any, formMessageBloc?:FormMessageBloc){
        const preOnChangeFunc = this._basicOnChange(nameOfInput);
        const val = this.validatorFunctionGiver(nameOfInput);
        const postOnChangeFunc = this.postOnChangeFunctionGiver(nameOfInput);
        if(preOnChangeFunc){
            preOnChangeFunc(currentValue);
            if(val){
                const validationResult = val(currentValue);
                if(!formMessageBloc){
                    formMessageBloc = BlocsProvider.search("FormMessageBloc",this.hostElement);
                }
                formMessageBloc!.postMessage(nameOfInput,validationResult!);
                if(postOnChangeFunc){
                    postOnChangeFunc(currentValue, validationResult);
                }
            }
        }
    }

    checkAllValidationPassed(){
        //check there are no validation messages
        let msgBloc = BlocsProvider.of<FormMessageBloc>("FormMessageBloc",this.hostElement);
        let msgState = JSON.parse(JSON.stringify(msgBloc!.state));
        if(Object.keys(msgState).length>0){
            return false;
        }else{
            return true;
        }
    }

    /**
     * returns a validator function for a given name of input
     * @param nameOfInput 
     */
    abstract validatorFunctionGiver(nameOfInput: string): ValidatorFunction<any>|undefined
    /**
     * returns a postValidation onChange function for a given name of input.
     * There is an inbuilt-onchange-function, however onchange function returned by ths method is executed (if returned) after this inbuilt-onchange-function.
     * This postOnChange function must perform custom business logic user wants to be executed after value change, for example change other input values or other stuffs.
     * @param nameOfInput 
     */
    abstract postOnChangeFunctionGiver(nameOfInput: string):PostValidationOnChangeFunction<any>|undefined
 }

 export interface InputBuilderConfig{
    bloc_name:string;
    name:string;
    type?:"hidden" | "text" | "search" | "tel" | "url" | "email" | "password" | "datetime" | "date" | "month" | "week" | "time" | "datetime-local" | "number" | "range" | "color" | "checkbox" | "radio" | "file" | "submit" | "image" | "reset" | "button",
    placeholder?:string;
    icon?:string;
    clearable?:boolean;
    inputmode?:"none"|"decimal"|"numeric"|"tel"|"search"|"email"|"url"
}


 export abstract class FormInputBuilder<V, F extends FormBloc> extends WidgetBuilder<F,FormState>{
     /**
      * Input made based on FormInputBuilder can use this to delegate change to Form.
      */
     protected hasChanged!:OnChangeFunction<V>;

     public get disabled() : boolean {
         if(this.bloc){
            return this.bloc.isDisabled(this.config.name);
         }else{
             return true;
         }
     }
     

     constructor( protected config: InputBuilderConfig){
         super(config.bloc_name);
     }

     connectedCallback(){
         super.connectedCallback();
         setTimeout(()=>{
             this.hasChanged = (newValue?:V)=>{
                this.bloc?.delegateChangeTo(this.config.name,newValue);
             }
         })
     }
 }

 export class MessageBuilder extends WidgetBuilder<FormMessageBloc,FormMessageState>{
     private name?: string;

     constructor(){
         super("FormMessageBloc");
         let forAtt = this.getAttribute("for");
         if(!forAtt){
             throw 'No for attribute present on a form message';
         }
         this.name = forAtt;
     }

     builder(state: FormMessageState): TemplateResult {
         let msg = state[this.name!];
         return html`<span>${msg}</span>`;
     }

 }

 customElements.define("form-message", MessageBuilder);


 export class FormBlocProvider<F extends FormBloc> extends BlocsProvider{
     builder(): TemplateResult {
         return html`<div><slot></slot></div>`;
     }

     constructor(formBloc: F){
         super((()=>{
             let n = formBloc.name;
             let t: any = {
                FormMessageBloc: new FormMessageBloc(),
             }
             t[n]=formBloc;
             return t;
         })());
     }
 }

export interface InputInfo{
    type:"SingleLineInput"|"TextAreaInput"|"CheckBox"|"DatePicker"|"RadioButtons"|"RangeSelector"|"ToggleButton";
    config: InputBuilderConfig;
    input_init_values?: string[]|RadioButtonValueLabelMap|string|DatePickerConfig;
    label?:string;
    input_info_msg?:string
}

export interface ValidatorFunctionGiver{
    (nameOfInput: string): ValidatorFunction<any> | undefined;
}

export interface PostOnChangeFunctionGiver{
    (nameOfInput: string): PostValidationOnChangeFunction<any> | undefined 
}

export interface FormSubmitFunction{
    (formBloc: FormBloc):Promise<void>
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