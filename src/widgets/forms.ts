/**
 * Inputs must be unware of form existense.
 */

import { Bloc, BlocType, BlocsProvider } from 'bloc-them'
import { WidgetBuilder } from '../utils/blocs';
import { TemplateResult, html } from 'lit-html';

 export interface FormState{
     [key:string]:any;
     /**
      * An entry in this set will disable this element
      */
     areDisabled?:Set<string>
 }

 export interface ValidatorFunction<V>{
     (currentValue: V):string|undefined;
 }

 export interface OnChangeFunction<V>{
     (currentValue:V):void;
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
            this.state.delete(nameOfInput);
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
            this.state[nameOfInput]=newValue;
            this.emit({...this.state});
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

 export abstract class FormInputBuilder<V, F extends FormBloc> extends WidgetBuilder<F,FormState>{
     protected onChange?:OnChangeFunction<V>;
     protected validator?:ValidatorFunction<V>;
     protected name?:string;
     protected messageBloc?: FormMessageBloc;
     private postOnChange?:PostValidationOnChangeFunction<V>;

     
     public get disabled() : boolean {
         if(this.bloc){
            return this.bloc.isDisabled(this.name!);
         }else{
             return true;
         }
     }
     

     constructor( private type:BlocType<F,FormState>){
         super(type);
         let t1 = this.getAttribute("name");
         if(t1){
             this.name = t1;
         }else{
             throw `Every form Input Widget must be given a name attribute.`
         }
     }

     connectedCallback(){
         super.connectedCallback();
         this.messageBloc=BlocsProvider.of(FormMessageBloc,this);
         this.validator = this.bloc?.validatorFunctionGiver(this.name!);
         this.postOnChange = this.bloc?.postOnChangeFunctionGiver(this.name!);
         
         let t1 = this.bloc?._basicOnChange(this.name!);
         if(t1){
            this.onChange = (newValue:V)=>{
                try{
                    t1!(newValue);
                    if(this.validator){
                        let t2 = this.validator(newValue);
                        this.messageBloc?.postMessage(this.name!,t2!);
                        if(this.postOnChange){
                            this.postOnChange(newValue, t2);
                        }
                    }
                }catch(e){
                    console.error(e);
                }
            }
         }
     }
 }

 export class MessageBuilder extends WidgetBuilder<FormMessageBloc,FormMessageState>{
     private name?: string;

     constructor(){
         super(FormMessageBloc);
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
         super([
             new FormMessageBloc(),
             formBloc
         ]);
     }
 }