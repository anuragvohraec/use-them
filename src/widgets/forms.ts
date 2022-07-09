/**
 * Inputs must be unware of form existense.
 */

import { Bloc, BlocBuilderConfig, BlocsProvider } from 'bloc-them'
import { WidgetBuilder } from '../utils/blocs';
import { TemplateResult, html, nothing } from 'lit-html';
import { Range } from './inputs/rangeselector';


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

    constructor(initState: FormState, protected formMessageBlocName:string="FormMessageBloc"){
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
            if(newValue===undefined || newValue === null){
                let t = {...this.state};
                delete  t[nameOfInput];
                this.emit(t);
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
            let validationResult:string|undefined;
            if(val){
                 validationResult = val(currentValue);
                if(!formMessageBloc){
                    formMessageBloc = BlocsProvider.search(this.formMessageBlocName,this.hostElement);
                }
                formMessageBloc!.postMessage(nameOfInput,validationResult!);
            }
            if(postOnChangeFunc){
                postOnChangeFunc(currentValue, validationResult);
            }
        }
    }

    checkAllValidationPassed(){
        //check there are no validation messages
        let msgBloc = BlocsProvider.search<FormMessageBloc>(this.formMessageBlocName,this.hostElement);
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
    inputmode?:"none"|"decimal"|"numeric"|"tel"|"search"|"email"|"url",
    /**
     * Used only with range input
     */
    rangeSelectorConfig?:{
        range:Range;
        isint:boolean;
        no_label:boolean;
        no_start:boolean;
    }
    
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
     

     constructor( protected config: InputBuilderConfig, protected blocConfig?:BlocBuilderConfig<FormState>){
         super(config.bloc_name,blocConfig);
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

     constructor(protected formMessageBlocName:string="FormMessageBloc"){
         super(formMessageBlocName);
     }

     connectedCallback(){
         super.connectedCallback();
         setTimeout(()=>{
            let forAtt = this.getAttribute("for");
            if(!forAtt){
                throw 'No for attribute present on a form message';
            }
            this.name = forAtt;
         });
     }

     builder(state: FormMessageState): TemplateResult {
         if(!this.name){
             return nothing as TemplateResult;
         }
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
