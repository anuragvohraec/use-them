## Scaffold usage
```html
<ut-scaffold>
    <div slot="title"><ut-h1 use="color: white">app_name</ut-h1></div>
    <div slot="body" style="height: 100%">
    <ut-tab-controller>
        <ut-tabs>
            <ut-tab index="0" icon="account-circle"><ut-h1>welcome_msg</ut-h1></ut-tab>
            <ut-tab index="1" icon="account-balance"><ut-h1>Some other screens1</ut-h1></ut-tab>
            <ut-tab index="2" icon="card-travel"><ut-h1>Some other screen2</ut-h1></ut-tab>
        </ut-tabs>
    </ut-tab-controller>
    </div>
    <div slot="menu">
        <ut-h3>app_name</ut-h3>
    </div>
</ut-scaffold>
```

## Raised Button / NoBlocRaisedButton
Extend RaisedButton or NoBlocRaisedButton and then
```html
<my-button use="background-color: #980dac"><ut-p use="color: white;">Show SnackBar</ut-p></my-button>
```

## Backable screen
```html
<backable-screen title="Yo Backable screen" use="primaryColor: green;"></backable-screen>
```

## Loading cell
```html
<loading-cell></loading-cell>
```

## Range Selector
We need to extend SelectorBloc and SelectorWidget
```html
import { BlocsProvider } from 'bloc-them';
import { html, TemplateResult } from 'lit-html';
import {FormInputBuilder, FormMessageBloc, FormState, HideBloc, RaisedButton, SelectorBloc, SelectorWidget, WidgetBuilder} from 'use-them';
import { SignUpFormBloc } from '../screens/sign-up-screen';

class StateSelectorBloc extends SelectorBloc<string>{
    private formBloc: SignUpFormBloc;
    private formMsgBloc: FormMessageBloc;

    onchange(selectedItems: Set<string>, context: HTMLElement): void {
        if(!this.formBloc){
            this.formBloc=BlocsProvider.of<SignUpFormBloc,any>("SignUpFormBloc",context);
        }
        if(!this.formMsgBloc){
            this.formMsgBloc=BlocsProvider.of<FormMessageBloc,any>("FormMessageBloc",context);
        }

        const cv=Array.from(selectedItems)[0];
        this.formBloc.delegateChangeTo("state",cv,this.formMsgBloc);
    }
    protected maxNumberOfSelect: number=1;

    async loadItems(): Promise<string[]> {
        return ["Andaman and Nicobar Islands ","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh ","Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu ","Delhi ","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir ","Jharkhand","Karnataka","Kerala","Ladakh ","Lakshadweep ","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry ","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];
    }

    protected _name: string="StateSelectorBloc";
}

class StateSelectorList extends SelectorWidget<string>{
    constructor(){
        super("StateSelectorBloc");
    }

    protected itemBuilder(item: string, index: number, isSelected: boolean): TemplateResult {
        return html`<div style="padding: 10px;border-bottom: 1px solid #929292;color:${isSelected?"white":"black"}">${item}</div>`;
    }
    protected itemToKey(item: string): string {
        return item;
    }
}
customElements.define("state-selector-list",StateSelectorList);

class OkButtonStateSelector extends RaisedButton<HideBloc,boolean>{
    onPress(): void {
        this.bloc.toggle();
    }

    constructor(){
        super("HideBloc");
    }
}
customElements.define("ok-button-state-selector",OkButtonStateSelector);

class StateSelectorLabel extends WidgetBuilder<SignUpFormBloc,FormState>{
    builder(state: FormState): TemplateResult {
        const cls = state["state"]?"black":"#838383";
        const cnt = state["state"]?state["state"]:"State";

        return html`<div style="height:40px; width: 100%;" @click=${()=>{
            const hb = BlocsProvider.of<HideBloc,any>("HideBloc",this);
            hb.toggle();
        }}>
        <lay-them in="row" ma="flex-start" ca="center">
        <span style="color:${cls};padding: 0px 10px;
    overflow: hidden;">${cnt}</span>
        </lay-them>
        </div>`;
    }

    constructor(){
        super("SignUpFormBloc",);
    }
}
customElements.define("state-selector-label",StateSelectorLabel);

export class StateSelector extends BlocsProvider{
    constructor(){
        super([
            new HideBloc(),
            new StateSelectorBloc()
        ])
    }
    
    builder(): TemplateResult {
        return html`
        <style>
            .container{
                width: 80%;
                height: 80%;
                background-color: white;
                border-radius: 4px;
            }
        </style>
        <div style="width: 100%; min-height: 40px; border-radius: 4px;background-color:#e6e6e6;">
            <state-selector-label></state-selector-label>
            <ut-dialogue>
                <lay-them ma="center" ca="center">
                    <div class="container">
                        <lay-them in="column" ma="flex-start" ca="stretch">
                            <div style="background-color: #6a56ac;
color: white;
padding: 10px;
border-radius: 4px 4px 0px 0px;">Select your state</div>
                            <div style="flex:1;overflow: scroll;padding: 0px 10px;">
                                <state-selector-list use="selection-color:#6a56ac;"></state-selector-list>
                            </div>
                            <div style="padding: 10px;">
                                <ok-button-state-selector use="background-color: #6a56ac;"><span style="color:white;">OK</span></ok-button-state-selector>
                            </div>
                        </lay-them>
                    </div>
                </lay-them>
            </ut-dialogue>
        </div>`;
    }
}
customElements.define("state-selector", StateSelector);
```