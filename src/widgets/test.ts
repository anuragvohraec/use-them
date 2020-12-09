import { FormBloc, ValidatorFunction, FormBlocProvider, PostValidationOnChangeFunction } from './forms';
import { ToggleButton } from './inputs/togglebutton';
import { RangeSelector, Range } from './inputs/rangeselector';
import { RaisedButton } from './buttons';
import { ScaffoldBloc, ScaffoldState } from './scaffold';
import { SingleLineInput } from './inputs/textinputs';


export class MyFormBloc extends FormBloc{
    postOnChangeFunctionGiver(nameOfInput: string): PostValidationOnChangeFunction<any> | undefined {
        switch(nameOfInput){
            case 'userChoice':
                return (nv:boolean, val)=>{
                    console.log("user choice is : ",nv);
                }
        }
    }
    constructor(){
        super({
            userChoice: true,
            priceRange: {start: 200, end:700},
            areDisabled: new Set(["userChoice"])
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
                        return `value cannot be null for priceRange`;
                    }
                }
            case 'userInput':
                return (newValue: string)=>{
                    if(newValue ==undefined){
                        return `value cannot be null for priceRange`;
                    }

                    let re = /[A-Za-z]/;
                    if(!re.test(newValue)){
                        return "Only alphabets allowed";
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


export class UserPassword extends SingleLineInput<MyFormBloc>{
    constructor(){
        super(MyFormBloc);
    }
}

customElements.define("user-password", UserPassword);

export class SelectLang extends SingleLineInput<MyFormBloc>{
    constructor(){
        super(MyFormBloc, ["English", "Hindi", "German"]);
    }
}

customElements.define("select-lang", SelectLang);