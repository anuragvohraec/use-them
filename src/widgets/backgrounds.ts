import { WidgetBuilder, BogusBloc } from '../utils/blocs';
import { TemplateResult, html,unsafeHTML, ListenerWidget } from 'bloc-them';


export class AnimatedGradientBackground extends WidgetBuilder<number>{
    private gradient_colors:string;

    build(state: number): TemplateResult {
        return html`
            <style>
        .animated-gradient {
            background: linear-gradient(-45deg, ${this.gradient_colors});
            background-size: 400% 400%;
            animation: gradient 15s ease infinite;
        }

        @keyframes gradient {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }
        .expanded{
            width: 100%;
            height: 100%;
        }
        </style>
            <div class="animated-gradient expanded">
            </div>
        `;
    }
    constructor(){
        super("BogusBloc",{
            BogusBloc: new BogusBloc()
        })
        this.gradient_colors = `#${this.theme.primaryColor},#${this.theme.secondaryColor}`
        if(this.useAttribute){
            let t = this.useAttribute["gradients"]
            if(t){
                this.gradient_colors=t;    
            }
        }
    }
}

customElements.define("animated-grad-bg", AnimatedGradientBackground);

export class ImageBackground extends ListenerWidget{
    build(state: number): TemplateResult {
        throw new Error("Method not implemented.");
    }
    constructor(){
        super();
    }
}