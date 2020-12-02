import { FormInput, FormBloc } from "./forms";
import { ToggleButton } from './inputs/togglebutton';
import { BlocsProvider, BlocBuilder } from 'bloc-them';
import { TemplateResult } from 'lit-html';


export interface MyFormState{
    isOK: boolean;
}

export class MyToggleButtonInput extends FormInput<MyFormState, boolean>{
    onchange(newValue: boolean): void {
        throw new Error("Method not implemented.");
    }
    validate(): string | undefined {
        throw new Error("Method not implemented.");
    }
}

export class MyFormBloc extends FormBloc<MyFormState>{
    constructor(){
        super({
            isOK:false
        })
    }
    getFormInputForName(nameOfInput: string): FormInput<MyFormState, any>|undefined {
        if(name==="mytooglebutton")   {
            return new MyToggleButtonInput(false, this);
        }
    }
}

export class MySwitch extends ToggleButton<MyFormState>{
    constructor(){
        super(MyFormBloc)
    }
}

customElements.define("my-toggle-switch",MySwitch);

export class MyFormBuilder extends BlocBuilder<MyFormBloc,MyFormState>{
    constructor(){
        super(MyFormBloc,{
            useThisBloc: new MyFormBloc()
        })
    }
    builder(state: MyFormState): TemplateResult {
        throw new Error("Method not implemented.");
    }

}