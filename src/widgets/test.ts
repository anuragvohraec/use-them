import { FormBloc, ValidatorFunction, FormBlocProvider, PostValidationOnChangeFunction } from './forms';
import { ToggleButton } from './inputs/togglebutton';
import { RangeSelector, Range } from './inputs/rangeselector';
import { RaisedButton } from './buttons';
import { ScaffoldBloc, ScaffoldState } from './scaffold';
import { SingleLineInput } from './inputs/textinputs';
import { CheckBox } from './inputs/checkbox';
import { HideBloc } from './dialogues';
import { WidgetBuilder } from '../utils/blocs';
import { html, TemplateResult } from 'lit-html';
import { InkWell } from './inkwell';
import { RadioButtonsBuilder } from './inputs/radiobuttons';
import {SelectorBloc, SelectorWidget} from './selectors';
import { BlocsProvider } from 'bloc-them';
import { DatePicker } from './inputs/date-picker';
import { CircularCounterBloc , GESTURE, GestureDetectorBloc, GestureDetector, GestureDetectorBuilder, VerticalScrollLimitDetector, HorizontalScrollLimitDetector} from './gesturedetector';
import { FilePickerBloc,FilePickerScreen } from '../screens/file-selector';
import { PickedFileInfoForOutPut } from '../interfaces';


export class MyFormBloc extends FormBloc{
    protected _name: string="MyFormBloc";

    postOnChangeFunctionGiver(nameOfInput: string): PostValidationOnChangeFunction<any> | undefined {
        switch(nameOfInput){
            case 'userChoice':
                return (nv:boolean, val)=>{
                    console.log("user choice is : ",nv);
                }
            case "selectVal":
                return (nv:string, valMsg)=>{
                    console.log("Value for user is: ",nv);
                }
        }
    }
    constructor(){
        super({
            userChoice: true,
            priceRange: {start: 200, end:700},
            areDisabled: new Set([])
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
            case 'selectVal':
                return (newValue:string)=>{
                    if(!newValue){
                      return "Select one of the options";  
                    }
                }
            default:
                break;
        }
    }

}

export class MyToggleButton extends ToggleButton<MyFormBloc>{
    constructor(){
        super({
            bloc_name:"MyFormBloc",
            name:"userChoice",
        });
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
        super({
            bloc_name:"MyFormBloc",
            name:"priceRange"
        })
    }
}

customElements.define("price-range", PriceRange);

//You can make it : MyFormBloc too if needed
export class MyButton extends RaisedButton<ScaffoldBloc,ScaffoldState>{
    onPress(): void {
        this.bloc?.postMessageToSnackBar("Hi this is a message for you!")
    }
    constructor(){
        super("ScaffoldBloc")
    }
}

customElements.define("my-button", MyButton)


export class UserPassword extends SingleLineInput<MyFormBloc>{
    constructor(){
        super({
            bloc_name:"MyFormBloc",
            name:"userInput",
            icon:"search",
            placeholder:"Search for user",
            type:"text"
        });
    }
}
customElements.define("user-password", UserPassword);

export class SelectLang extends SingleLineInput<MyFormBloc>{
    constructor(){
        super({
            bloc_name:"MyFormBloc",
            name:"selectLang",
            placeholder:"Select Lang"
        }, ["English", "Hindi", "German"]);
    }
}

customElements.define("select-lang", SelectLang);

export class MyCheckBox extends CheckBox<MyFormBloc>{
    constructor(){
        super({
            bloc_name:"MyFormBloc",placeholder:"My Check Box:", name:"myCheckBox"},"CheckBoxValue");
    }
}
customElements.define("my-check-box", MyCheckBox);

class MyDialogueButton extends RaisedButton<HideBloc,boolean>{
    onPress(): void {
        this.bloc?.toggle();
    }

    constructor(){
        super("HideBloc",{useThisBloc: new HideBloc()},[40,100])
    }
}

customElements.define("my-dialogue-button",MyDialogueButton);

class CrossButtonForPopUp extends WidgetBuilder<HideBloc,boolean>{
    builder(state: boolean): TemplateResult {
        return html`<div style="color: white" @click=${()=>{
            this.bloc?.toggle()
        }}>X</div>`;
    }
    constructor(){
        super("HideBloc")
    }
}

customElements.define("cross-button-close-dialogue",CrossButtonForPopUp);

class MyInkwell extends InkWell{
    constructor(){
        super();
    }
    onpressaction(e:Event){
        console.log("called my action");
    }
}

customElements.define("my-ink-well",MyInkwell);

class MyRadioButtons extends RadioButtonsBuilder<MyFormBloc>{
    constructor(){
        super("MyFormBloc",{
            "val1": "Value 1",
            "val2": "Value 2",
            "val3": "Value 3"
        })
    }
}
customElements.define("my-radio-buttons",MyRadioButtons);

interface Employee{
    name: string;
    age: number;
}
class MySelectorBloc extends SelectorBloc<Employee>{
    onchange(selectedItems: Set<Employee>): void {
        console.log("Value chnaged");
        
    }
    protected maxNumberOfSelect: number=2;
    async loadItems(): Promise<Employee[]> {
        return [{name: "n1",age:1},{name: "n2",age:2},{name: "n3",age:3}];
    }
    protected _name: string="MySelectorBloc";
}

class MySelectorWidget extends SelectorWidget<Employee>{
    protected itemBuilder(item: Employee, index: number, isSelected: boolean): TemplateResult {
        return html`<div>${item.name}</div><div>${item.age}</div>`;
    }
    protected itemToKey(item: Employee): string {
        return item.name;
    }

    constructor(){
        super("MySelectorBloc");
    }
}
customElements.define("my-selector-list",MySelectorWidget);

class MySelectorWidgetContainer extends BlocsProvider{
    builder(): TemplateResult {
       return html`<my-selector-list></my-selector-list>`;
    }
    constructor(){
        super({
            MySelectorBloc: new MySelectorBloc()
        });
    }
}

customElements.define("my-selector",MySelectorWidgetContainer);


class MyDatePicker extends DatePicker{
    constructor(){
        super({
            formBlocName:"MyFormBloc",
            init_date: Date.now(),
            maxYear: 2025,
            minYear: 1930,
            nameForThisInForm:"date",
            placeholder:"Select your date"
        })
    }
}

customElements.define("my-date-picker",MyDatePicker);


class TestMutiData extends WidgetBuilder<CircularCounterBloc,number>{
    private data:string[]=["One","Two","Three","Four"];

    connectedCallback(){
        super.connectedCallback();
        this.bloc?.setMaxCount(this.data.length);
    }

    builder(state: number): TemplateResult {
        let t = this.data[state];
        return html`<div style="width:200px;height:200px;"><lay-them ma="center" ca="center">${t}</lay-them></div>`
    }

    constructor(){
        super("CircularCounterBloc")
    }
}
customElements.define("test-horizontal-slider",TestMutiData);


class TestGestureDetector extends GestureDetectorBuilder{
    builder(state: GESTURE): TemplateResult {
        let t:string="";
        switch (state) {
            case GESTURE.NO_ACTION: t="NO_ACTION";  break;
            case GESTURE.TAP: t="TAP"; break;
            case GESTURE.SWIPE_LEFT: t="SWIPE_LEFT"; break;
            case GESTURE.SWIPE_RIGHT: t="SWIPE_RIGHT"; break;
            case GESTURE.SWIPE_UP: t="SWIPE_UP"; break;
            case GESTURE.SWIPE_DOWN: t="SWIPE_DOWN";break;
            case GESTURE.DOUBLE_TAP: t="DOUBLE_TAP";break;
        }
        return html`<div style="background-color:grey; width:200px; height: 200px;">${t}</div>`;
    }

    constructor(){
        super(1,50);
    }
}
customElements.define("test-gesture-detector",TestGestureDetector);

class VTestDetector extends VerticalScrollLimitDetector{
    constructor(){
        super({})
    }

    bottomLimitReached(): void {
        console.log("Its bottom");
    }
    topLimitReached(): void {
        console.log("Its top");
    }
}
customElements.define("test-v-scroll-detector",VTestDetector);

class HTestDetector extends HorizontalScrollLimitDetector{
    constructor(){
        super({})
    }

    rightLimitReached(): void {
        console.log("Right Limit reached");
    }
    leftLimitReached(): void {
        console.log("left Limit reached");
    }
}
customElements.define("test-h-scroll-detector",HTestDetector);

/////////////// FILE PICKER CODE: START

class TestFilePickerBloc extends FilePickerBloc{
    upOnFileSelection(filePicked: PickedFileInfoForOutPut[]): void {
        console.log("Picked file: ", filePicked);
    }
    protected _name: string="TestFilePickerBloc";
}

class TestFilePicker extends FilePickerScreen{
    constructor(){
        super({
            bloc_name:"TestFilePickerBloc",
            max_file: 3,
            bloc_config: {
                blocs_map:{
                    TestFilePickerBloc: new TestFilePickerBloc()
                }
            }
        })
    }
}
customElements.define("test-file-picker",TestFilePicker);

// class TestFilePicker extends FilePickerScreen{
//     constructor(){
//         super({
//             bloc_name:"TestFilePickerBloc",
//             max_file: 3,
//             bloc_config: {
//                 blocs_map:{
//                     TestFilePickerBloc: new TestFilePickerBloc()
//                 }
//             },
//             picker_config:{
//                 type: FilePickerType.IMAGE,
//                 accept:"image/*"
//             }
//         })
//     }
// }
// customElements.define("test-file-picker",TestFilePicker);
/////////////// FILE PICKER CODE: END