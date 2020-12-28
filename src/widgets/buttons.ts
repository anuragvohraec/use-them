import { WidgetBuilder, ActionBloc } from '../utils/blocs';
import { Bloc, BlocType, BlocBuilderConfig } from 'bloc-them';
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

    

    constructor(type: BlocType<B,S>,  configs?: BlocBuilderConfig<B, S>, shades:number[]=[20,80]){
        super(type, configs);
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