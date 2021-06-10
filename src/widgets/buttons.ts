import { WidgetBuilder, ActionBloc, NoBlocWidgetBuilder, BogusBloc } from '../utils/blocs';
import { Bloc, BlocBuilderConfig } from 'bloc-them';
import { TemplateResult, html } from 'lit-html';
import { ColorUtil } from '../utils/utils';


export abstract class RaisedButton<B extends Bloc<S>, S> extends WidgetBuilder<B,S>{
    private bgColor: string;
    private onPressButtonColor:string;
    private light: string;
    
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
                    box-shadow: 0px 4px 12px 0px #0000009e;
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

    

    constructor(blocName: string,  configs?: BlocBuilderConfig<B, S>, shades:number[]=[20,80]){
        super(blocName, configs);
        this.bgColor = "#ffffff";
        if(this.useAttribute){
            let bgc =this.useAttribute!["background-color"];
            if(bgc){
                this.bgColor = bgc;
            }
        }
        this.onPressButtonColor=ColorUtil.shadeColor(this.bgColor,shades[0]);
        this.light=ColorUtil.shadeColor(this.bgColor,shades[1]);
    }

    abstract onPress():void;

    buttonAction = ()=>{this.onPress()};

}




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
        <div style="overflow: hidden;height: ${radius};width: ${radius};background-color: #7b7b7b12;border-radius: 50%;">
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