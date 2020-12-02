import { WidgetBuilder } from '../utils/blocs';
import { Bloc, BlocType } from 'bloc-them';
import { TemplateResult, html } from 'lit-html';

/**
 * Have to support
 * input disable/enable
 * on error.
 * on focus
 */

 /**
  * This class is used to provide logi to input builders, as input builders will not be extensible, so we need to provide this logic to them.
  */
export abstract class FormInput<S, V>{
    constructor(private _value:V, private _formBloc: FormBloc<S>){}

    
    public get formBloc() : FormBloc<S> {
        return this._formBloc;
    }
    

    public get value() : V {
        return this._value;
    }
    
    
    public set value(v : V) {
        this._value = v;
        this.onchange?.(v);
    }
    
    /**
     * Any on change action that need to be performed, like some checks or validation
     * @param newValue 
     */
    abstract onchange(newValue: V):void;

    /**
     * The validation function to be used by the form to validate the form, before submit.
     */
    abstract validate():string|undefined;
}

export enum FormStatus{
    PURE,
    VALID,
    INVALID,
    SUBMISSION_FAILED,
    SUBMISSION_IN_PROGRESS,
    SUBMISSION_SUCCEEDED,
}

interface MessageRegistry{
    [key:string]:string;
}

export class FormState<S>{
    constructor(public data:S, public formStatus: FormStatus, public messages:MessageRegistry={}){}
}

export abstract class FormBloc<S> extends Bloc<FormState<S>>{
        private _activeFormInputRegistry:{[key:string]:FormInput<S,any>}={};

        constructor(initState: S){
            super(new FormState(initState,FormStatus.PURE));
        }

        /**
         * this one maps a form input for a give input id (name attribute of the input builders)
         * should return new object every time.
         * @param nameOfInput 
         */
        abstract getFormInputForName(nameOfInput: string):FormInput<S,any>|undefined;

        _subscribe=(nameOfInput: string):FormInput<S,any>=>{
            let t = this.getFormInputForName(nameOfInput);
            if(!t){
                throw `No FormInput found for ${nameOfInput}`;
            }else{
                this._activeFormInputRegistry[nameOfInput]=t;
                return t;
            }
        }

        _unsubscribe=(nameOfInput: string)=>{
            let t = this._activeFormInputRegistry[nameOfInput];
            if(t){
                delete this._activeFormInputRegistry[nameOfInput];
            }
        }


        validate=()=>{
            let msgs: MessageRegistry = {};
            let formStatus = FormStatus.VALID;
            for(let i of Object.keys(this._activeFormInputRegistry)){
                let m = this._activeFormInputRegistry[i].validate();
                if(m){
                    formStatus=FormStatus.INVALID;
                    msgs[i]=m;
                }
            }
            if(formStatus===FormStatus.INVALID){
                this.emit(new FormState<S>(this.state.data,formStatus, msgs));
            }
        }
}


/**
 * Always provide a name attribute on FormInputBuilder
 */
export abstract class FormInputBuilder<S,V> extends WidgetBuilder<FormBloc<S>,FormState<S>>{
    private _name?: string;
    private _formInput?: FormInput<S,V>;

    constructor(type: BlocType<FormState<S>>){
        super(type);
        let t = this.getAttribute("name");
        if(t){
            this._name = t;
        }else{
            throw "no name attribute provided for the FormInputBuilder";
        }
    }

    disconnectedCallback(){
        super.disconnectedCallback();
        this.bloc?._unsubscribe(this._name!);
    }

    connectedCallback(){
        super.connectedCallback();
        this._formInput = this.bloc?._subscribe(this._name!);
    }

    /**
     * use this to use onchange and validation logic
     */
    public get formInput() : FormInput<S,V> {
        return this._formInput!;
    }

}

/**
 * Extend and only pass bloc type to constructor. and html tag pass for attribute
 */
export abstract class ErrorMessageBuilder<S,V>  extends WidgetBuilder<FormBloc<S>,FormState<S>>{
    private _msg? : string;

    builder(state: FormState<S>): TemplateResult {
        return html`<span>${this._msg}</span>`;
    }
    
    constructor(type: BlocType<FormState<S>>){
        super(type,{
            buildWhen:(p,n)=>{
                let t = this.getAttribute("for");
                if(p!==n && t && n.messages[t]){
                    this._msg = n.messages[t];
                    return true;
                }
                return false;
            }
        });
    }
}

