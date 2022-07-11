import { FormBloc, ValidatorFunction, FormBlocProvider, PostValidationOnChangeFunction } from './forms';
import { ToggleButton } from './inputs/togglebutton';
import { RangeSelector, Range } from './inputs/rangeselector';
import { RaisedButton } from './buttons';
import { ScaffoldBloc, ScaffoldState } from './scaffold';
import { SingleLineInput, TextAreaInput } from './inputs/textinputs';
import { CheckBox } from './inputs/checkbox';
import { HideBloc } from './dialogues';
import { BogusBloc, WidgetBuilder } from '../utils/blocs';
import { html, nothing, TemplateResult } from 'lit-html';
import { InkWell } from './inkwell';
import { RadioButtonsBuilder } from './inputs/radiobuttons';
import {CreateSearchableSelector, SelectorBloc, SelectorWidget} from './selectors';
import { BlocsProvider } from 'bloc-them';
import { DatePicker } from './inputs/date-picker';
import { CircularCounterBloc , GESTURE, GestureDetectorBloc, GestureDetector, GestureDetectorBuilder, VerticalScrollLimitDetector, HorizontalScrollLimitDetector} from './gesturedetector';
import { FilePickerBloc,FilePickerScreen, FilePickerType } from '../screens/file-selector';
import { PickedFileInfoForOutPut } from '../interfaces';
import { ConfirmationDialogue } from './confirmation-dialogue';
import { QrCodeListenerBloc, QrCodeScannerConfig, QrResult } from './qr-code-scanner';
import { SmartTabsBuilder } from './smart-tabs';
import { GenerateVerticalTabs } from './vertical-tabs';


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
            case "myCheckBox":
                return (nv:string, valMsg)=>{
                    console.log("Check box value is: ",nv);
                }
            case "date":
                return (nv:string, valMsg)=>{
                    console.log("Date value is: ",nv);
                }
        }
    }
    constructor(){
        super({
            userChoice: true,
            priceRange: {start: 0  , end:2},
            myCheckBox: "CheckBoxValue",
            date: -1214298118060,
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
        super("HideBloc",{blocs_map:{
            HideBloc: new HideBloc(true,"ddf")
        }},[40,100])
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
        super({bloc_name:"MyFormBloc",name:"selectVal"},{
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
class MySelectorBloc extends SelectorBloc{
    onchange(selectedItems: Set<Employee>): void {
        console.log("Value chnaged");
        
    }
    protected maxNumberOfSelect: number=2;
    async loadItems(): Promise<Employee[]> {
        return [{name: "n1",age:1},{name: "n2",age:2},{name: "n3",age:3}];
    }
    protected _name: string="MySelectorBloc";
}

class MySelectorWidget extends SelectorWidget{
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


class MyDatePicker extends DatePicker<MyFormBloc>{
    constructor(){
        super({bloc_name: "MyFormBloc",name:"date"},{
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
            },
            picker_config:{
                type: FilePickerType.IMAGE
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


//////////////// Text Area code: START
class MyTextArea extends TextAreaInput<MyFormBloc>{
    constructor(){
        super({
            name:"desc",
            bloc_name:"MyFormBloc",
            placeholder:"Description"
        })
    }
}
customElements.define("test-my-text-area",MyTextArea);
//////////////// Text Area code: END

///////////////// Confirmation Dialogue code: START
class ShowUserConfirmationButton extends RaisedButton<HideBloc,boolean>{
    onPress(): void {
       this.bloc?.toggle();
    }

    constructor(){
        super("HideBloc",{
            blocs_map: {
                HideBloc: new HideBloc(true,"confirmation_box1")
            }
        })
    }
}
customElements.define("test-conf-button",ShowUserConfirmationButton);

class GetUSerConfirmation extends ConfirmationDialogue{
    constructor(){
        super("HideBloc",{
            msg: "Hello this is confirmation message",
            title: "Title of this",
            user_comments_msg: "Give ur inputs...."
        })
    }
    yesAction: Function=(e:Event)=>{
        this.show_in_progress();
        console.log(this.user_msg);
        setTimeout(()=>{
            this.show_buttons();
            this.bloc?.toggle();
        },4000);
    }
    noAction: Function=(e:Event)=>{
        this.bloc?.toggle();
    }
}
customElements.define("test-conf-dia",GetUSerConfirmation);
///////////////// Confirmation Dialogue code: End


class TestQrCodeListenerBloc extends QrCodeListenerBloc{
    user_selected_qr_codes(result: QrResult[]) {
        console.log("user scanned: ",result.map(e=>e.rawValue));
    }
    protected _name: string="TestQrCodeListenerBloc";

    constructor(){
        super([]);
    }
}

class TesQrCodeIconButtonDisplayer extends WidgetBuilder<BogusBloc,number>{
    private qrConfig: QrCodeScannerConfig={
        notify_bloc_name:"TestQrCodeListenerBloc",
        sound_url:"/sound/scan_sound.mp3"
    }

    constructor(){
        super("BogusBloc",{
            blocs_map: {
                BogusBloc: new BogusBloc(),
                TestQrCodeListenerBloc: new TestQrCodeListenerBloc(),
                QrCodeHideBloc: new HideBloc()
            } 
        })
    }
    builder(state: number): TemplateResult {
        return html`<labeled-icon-button icon="qrcode" label="scan" @click=${()=>{
            BlocsProvider.search<HideBloc>("QrCodeHideBloc",this)?.toggle();
        }}></labeled-icon-button>
        <ut-qr-code-widget .qrConfig=${this.qrConfig}></ut-qr-code-widget>`;
    }
}
customElements.define("test-qr-code-button",TesQrCodeIconButtonDisplayer);

CreateSearchableSelector.create({
    id_key_name:"_id",
    maxNumberOfSelect:2,
    search_key_name:"name",
    search_placeholder:"Search for employee",
    selector_hide_bloc_name:"HideSearchSelectorBloc",
    selector_type:"list",
    tag_name:"test-search-employee",
    title:"Search for employee",
    loadItemsFunction:async()=>{
        return [
            {_id:"1",name:"Anurag"},
            {_id:"2",name:"Tony"},
            {_id:"3",name:"Steve"},
            {_id:"4",name:"Natasha"},
            {_id:"5",name:"Hawkey"},
            {_id:"6",name:"Banner"},
            {_id:"7",name:"Thor"},
        ];
    },
    onChangeFunction:(si,ctx)=>{
        console.log(Array.from(si));
    },
    itemBuilderFunction:(item,index,isSelected:boolean)=>{
        return html`<div style="padding:5px;">${item["name"]}</div>`;
    }
})


class TesSearchableSelectorButtonDisplayer extends WidgetBuilder<BogusBloc,number>{

    constructor(){
        super("BogusBloc",{
            blocs_map: {
                BogusBloc: new BogusBloc(),
                HideSearchSelectorBloc: new HideBloc(),
            } 
        })
    }
    builder(state: number): TemplateResult {
        return html`<labeled-icon-button icon="search" label="Employee" @click=${()=>{
            BlocsProvider.search<HideBloc>("HideSearchSelectorBloc",this)?.toggle();
        }}></labeled-icon-button>
        <test-search-employee></test-search-employee>`;
    }
}
customElements.define("test-search-button",TesSearchableSelectorButtonDisplayer);

SmartTabsBuilder.create({
    tag_name: "test-smart-tabs",
    smartTabConfig: [{icon:"done",id:"id1",label:"Label1"},
    {icon:"today",id:"id2",label:"Label2 is very big for some space and this should be still very big and big too see how much"},
    {icon:"insert-drive-file",id:"id3",label:"Label3"},
    {icon:"highlight",id:"id4",label:"Label4"},
    

    {icon:"warning",id:"id5",label:"Label5"},
    {icon:"chevron-left",id:"id6",label:"Label6"},
    {icon:"insert-drive-file",id:"id7",label:"Label7"},
    {icon:"clear",id:"id8",label:"Label8"},

    {icon:"attach-file",id:"id9",label:"Label9"},
    {icon:"qrcode",id:"id10",label:"Label10"},
    {icon:"account-circle",id:"id11",label:"Label11"},
    {icon:"account-balance",id:"id12",label:"Label12"}
],
    builderForIdFunction:(id:string,ctx)=>{
        switch(id){
            default: return html`<div>${id}</div>`;
        }
    },
    onTabChangeCallBack:(id)=>{
        console.log("Tab changed: ",id);
    }
})

GenerateVerticalTabs.create({
    tag_name:"test-vertical-tabs",
    tabs_name_icon:["search","add","name3","name4 with big title", "name5","name6","nam7"],
    builder_function:(tab_name)=>{
        switch(tab_name){
            case "name1": return html`
                <div>${tab_name}</div>
            `;
            default: return html`
            <div>${tab_name}</div>
            `;
        }
        return nothing as TemplateResult;
    }
})