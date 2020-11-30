import { WidgetBuilder } from '../utils/blocs';
import { Bloc, BlocType } from 'bloc-them';

/**
 * Have to support
 * input disable/enable
 * on error.
 * on focus
 */

 /**
  * This class is used to provide logi to input builders, as input builders will not be extensible, so we need to provide this logic to them.
  */
export abstract class FormInput<V>{
    constructor(private _value:V){}

    
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

export class Message{
    constructor(public forInputId:string, public message: string){}
}

interface MessageRegistry{
    [key:string]:Message;
}

export class FormState{
    constructor(public formStatus: FormStatus, public messages:MessageRegistry={}){}
}

export abstract class FormBloc extends Bloc<FormState>{
        private _activeFormInputRegistry:{[key:string]:FormInput<any>}={};

        constructor(){
            super(new FormState(FormStatus.PURE));
        }

        /**
         * this one maps a form input for a give input id (name attribute of the input builders)
         * should return new object every time.
         * @param nameOfInput 
         */
        abstract getFormInputForName(nameOfInput: string):FormInput<any>;

        _subscribe=(nameOfInput: string):FormInput<any>=>{
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


        _validate=()=>{
            let msgs: MessageRegistry = {};
            let formStatus = FormStatus.VALID;
            for(let i of Object.keys(this._activeFormInputRegistry)){
                let s = this._activeFormInputRegistry[i].validate();
                if(s){
                    formStatus=FormStatus.INVALID;
                    msgs[i]=new Message(i,s);
                }
            }
            if(formStatus===FormStatus.INVALID){
                this.emit(new FormState(formStatus, msgs));
            }
        }
}


/**
 * Always provide a name attribute on FormInputBuilder
 */
export abstract class FormInputBuilder<V> extends WidgetBuilder<FormBloc,FormState>{
    private _name?: string;
    private _formInput?: FormInput<V>;

    constructor(private type: BlocType<FormState>){
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
    public get formInput() : FormInput<V> {
        return this._formInput!;
    }
    

}

//TODO Message builder to 