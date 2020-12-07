import { WidgetBuilder } from '../utils/blocs';
import { Bloc, BlocType, BlocBuilderConfig } from 'bloc-them';
import { TemplateResult, html } from 'lit-html';
import { ColorUtil } from '../utils/utils';

export class RaisedButton<B extends Bloc<S>, S> extends WidgetBuilder<B,S>{
    private bgColor: string;
    private onPressButtonColor:string;
    private light: string;

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
                }
                .button:active{
                    box-shadow: 0px 0px 0px 0px #0000009e
                }
            </style>
            <div class="ripple button" style="padding: 20px; min-height: 80px;text-align: center; background-color: ${this.bgColor};border-radius:${this.theme.cornerRadius}px"><slot></slot></div>
        `;
    }

    constructor(type: BlocType<B,S>,  configs?: BlocBuilderConfig<B, S>){
        super(type, configs);
        this.bgColor = "#ffffff";
        if(this.useAttribute){
            let bgc =this.useAttribute!["background-color"];
            if(bgc){
                this.bgColor = bgc;
            }
        }
        this.onPressButtonColor=ColorUtil.shadeColor(this.bgColor,20);
        this.light=ColorUtil.shadeColor(this.bgColor,80);
    }

}