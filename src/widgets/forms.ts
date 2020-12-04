/**
 * Inputs must be unware of form existense.
 */

import { Bloc, BlocType, BlocsProvider } from 'bloc-them'
import { WidgetBuilder } from '../utils/blocs';
import { TemplateResult, html } from 'lit-html';

 export interface FormState{
     [key:string]:any;
 }

 export interface ValidatorFunction<V>{
     (currentValue: V):string|undefined;
 }

 export interface OnChangeFunction<V>{
     (currentValue:V):void;
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

    onChangeFunctionGiver(nameOfInput:string):OnChangeFunction<any>|undefined{
        return (newValue: any)=>{
            this.state[nameOfInput]=newValue;
            this.emit({...this.state});
        }
    }

    abstract validatorFunctionGiver(nameOfInput: string): ValidatorFunction<any>|undefined
 }

 export abstract class FormInputBuilder<V, F extends FormBloc> extends WidgetBuilder<F,FormState>{
     private onChange?:OnChangeFunction<V>;
     private validator?:ValidatorFunction<V>;
     private name?:string;
     private messageBloc?: FormMessageBloc;

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
         let t1 = this.bloc?.onChangeFunctionGiver(this.name!);
         if(t1){
            this.onChange = (newValue:V)=>{
                t1!(newValue);
                if(this.validator){
                    let t2 = this.validator(newValue);
                    if(t2){
                        this.messageBloc?.postMessage(this.name!,t2);
                    }
                }
            }
         }
     }
 }

 export class MessageBuilder extends WidgetBuilder<FormMessageBloc,FormMessageState>{
     private name?: string;

     constructor(){
         super(FormMessageBloc, {
             buildWhen:(p,n)=>{
                 let t = this.getAttribute("for");
                 if(t){
                    if(n[t]){
                        this.name = n[t];
                        return true;
                    }else{
                        return false;
                    }
                 }else{
                     throw `No for attribute present on Message`;
                 }
             }
         });
     }

     builder(state: FormMessageState): TemplateResult {
         return html`<span>${this.name}</span>`;
     }

 }


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