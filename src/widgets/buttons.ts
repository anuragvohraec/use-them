import { WidgetBuilder, ActionBloc, NoBlocWidgetBuilder, BogusBloc } from '../utils/blocs';
import { Bloc, BlocBuilderConfig } from 'bloc-them';
import { TemplateResult, html } from 'lit-html';
import { ColorUtil } from '../utils/utils';
import { UseThemConfiguration } from '../configs';


export abstract class RaisedButton<B extends Bloc<S>, S> extends WidgetBuilder<B,S>{
    private bgColor!: string;
    private onPressButtonColor!:string;
    private light!: string;
    
    isDisabled(){
        let t = this.hasAttribute("disabled");
        
        if(t){
            return true;
        }else{
            return false;
        }
    }

    builder(state: S): TemplateResult {
        return html`
            <style>
                .ripple {
                background-position: center;
                transition: background 0.8s;
                }
                .ripple:hover {
                    background: ${this.onPressButtonColor} radial-gradient(circle, transparent 1%, ${this.onPressButtonColor} 1%) center/15000%;
                }
                .ripple:active {
                    background-color: ${this.light};
                    background-size: 100%;
                    transition: background 0s;
                }
                .button{
                    box-shadow: 1px 1px 3px 0px #0000006e;
                    display: flex;
                    flex-direction: column;
                    flex-wrap: nowrap;
                    justify-content: center;
                    align-items: stretch;
                    user-select: none; 
                    min-height: ${this.theme.button_height};
                    text-align: center; 
                    background-color: ${this.isDisabled()?this.theme.button_disable_color:this.bgColor};
                    border-radius:${this.theme.cornerRadius}
                }
                .button:active{
                    box-shadow: 0px 0px 0px 0px #0000009e
                }
            </style>
            <div class="${(()=>{
                if(this.isDisabled()){
                    return "button";
                }else{
                    return "ripple button";
                }
            })()}" @click=${{
                handleEvent: (e:Event)=>{
                    if(!this.isDisabled()){
                        this.buttonAction();
                    }
                },
                capture: false
            }}><slot></slot></div>
        `;
    }

    connectedCallback(){
        super.connectedCallback();
        setTimeout(()=>{
            this.bgColor = this.theme.primaryColor;
            this.onPressButtonColor=ColorUtil.shadeColor(this.bgColor,this.shades[0]);
            this.light=ColorUtil.shadeColor(this.bgColor,this.shades[1]);
            this._build(this.state!);
        })
    }
    

    constructor(blocName: string,  configs?: BlocBuilderConfig<B, S>,private shades:number[]=[20,80],){
        super(blocName, configs);
    }

    abstract onPress():void;

    buttonAction = ()=>{
        navigator.vibrate(UseThemConfiguration.PRESS_VIB);
        this.onPress();
    };

}



/**
 * ## Attributes:
 * * icon
 * * label
 * * use : for color
 */
export class LabeledIconButton extends NoBlocWidgetBuilder{

    private get icon() : string {
        let t =this.getAttribute("icon");
        if(!t){
            throw "No icon provided";
        }
        return t;
    }

    
    public get label() : string|null {
        let t =this.getAttribute("label");
        return t; 
    }

    builder(state: number): TemplateResult {
        const color = this.useAttribute?.["color"];
        return html`
        <ink-well>
            <lay-them ca="center" ma="center">
                <ut-icon icon="${this.icon}" use="icon_inactive: ${color}"></ut-icon>
                <ut-h5 use="color: ${color};">${this.label}</ut-h5>
            </lay-them>
        </ink-well>
        <slot></slot>
        `;
    }
}

if(!customElements.get("labeled-icon-button")){
    customElements.define("labeled-icon-button",LabeledIconButton);
}

export class CircularIconButton extends NoBlocWidgetBuilder{

    builder(state: number): TemplateResult {
        const radius = this.useAttribute?.["radius"]??"50px";
        const icon = this.useAttribute?.["icon"];
        if(!icon){
            throw "No icon provided in use attribute for circular-icon-button";
        }
        return html`
        <div style="overflow: hidden;height: ${radius};width: ${radius};background-color: var(--bg-color,#7b7b7b12);border-radius: 50%;">
            <ink-well><lay-them ma="center" ca="center"><ut-icon icon="${icon}" use="icon_inactive: ${this.theme.primaryColor}"></ut-icon></lay-them></ink-well>
        </div>`;
    }
}
if(!customElements.get("circular-icon-button")){
    customElements.define("circular-icon-button",CircularIconButton);
}

export abstract class NoBlocRaisedButton extends RaisedButton<BogusBloc,number>{
    constructor(){
        super("BogusBloc",{
            useThisBloc: new BogusBloc()
        })
    }
}