import { FormBloc, ValidatorFunction, FormBlocProvider } from './forms';
import { ToggleButton } from './inputs/togglebutton';
import { BlocsProvider } from 'bloc-them';
import { TemplateResult } from 'lit-html';
import { RangeSelector, Range } from './inputs/rangeselector';
import { RaisedButton } from './buttons';
import { BogusBloc } from '../utils/blocs';
import { ScaffoldBloc, ScaffoldState } from './scaffold';


export class MyFormBloc extends FormBloc{
    constructor(){
        super({
            userChoice: true,
            priceRange: {start: 200, end:700}
        });
    }

    validatorFunctionGiver(nameOfInput: string): ValidatorFunction<any> | undefined {
        switch (nameOfInput) {
            case 'userChoice':
                return (newValue:boolean)=>{
                    if(newValue === undefined){
                        return 'value for userChoice cannot be undefined';
                    }
                }
            case 'priceRange':
                return (newValue: Range)=>{
                    if(newValue ==undefined){
                        return `value canno eb null for priceRange`;
                    }
                }
            default:
                break;
        }
    }

}

export class MyToggleButton extends ToggleButton<MyFormBloc>{
    constructor(){
        super(MyFormBloc);
    }
}

customElements.define("my-toggle-button", MyToggleButton);

export class MyForm extends FormBlocProvider<MyFormBloc>{
    constructor(){
        super(new MyFormBloc())
    }
}

customElements.define("my-form", MyForm);


export class PriceRange extends RangeSelector<MyFormBloc>{
    constructor(){
        super(MyFormBloc)
    }
}

customElements.define("price-range", PriceRange);

//You can make it : MyFormBloc too if needed
export class MyButton extends RaisedButton<ScaffoldBloc,ScaffoldState>{
    onPress(): void {
        this.bloc?.postMessageToSnackBar("Hi this is a message for you!")
    }
    constructor(){
        super(ScaffoldBloc)
    }
}

customElements.define("my-button", MyButton)