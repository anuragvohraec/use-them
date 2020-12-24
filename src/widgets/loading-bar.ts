import {Bloc} from 'bloc-them';
import { TemplateResult,html } from 'lit-html';
import { WidgetBuilder } from '../utils/blocs';

export class ProgressBloc extends Bloc<number>{
    private _completed:boolean;
    constructor(){
        super(0);
        this._completed=false;
    }

    
    public get completed() : boolean {
        return this._completed;
    }
    

    updateProgress(percentProgress: number){
        let newProgress = 7.8 * percentProgress;
        if(!this._completed){
            if(newProgress>=780){
                this.markAsComplete();
            }else{
                this.emit(newProgress);
            }
        }
    }
    markAsComplete(){
        this.emit(780);
        this._completed=true;
    }
}


/**
 * Extends this class and provide an extends progress Bloc.
 */
export abstract class ProgressBarBuilder extends WidgetBuilder<ProgressBloc,number>{

    constructor(progressBloc : ProgressBloc){
        super(ProgressBloc, {
            useThisBloc: progressBloc
        });
    }

    builder(state: number): TemplateResult {
        return html`
<svg 
style="height: 4px;width: 100%;"
inkscape:version="1.0.1 (0767f8302a, 2020-10-17)" sodipodi:docname="progress-bar.svg" version="1.1" viewBox="0 0 800 50" xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" preserveAspectRatio="none">
<linearGradient id="linearGradient850" x1="0" x2="500" y1="53.936" y2="50.846" gradientUnits="userSpaceOnUse">
        <stop stop-color=${this.theme.secondaryColor} offset="0"></stop>
        <stop stop-color=${this.theme.primaryColor} offset="1"></stop>
    </linearGradient>
 <g inkscape:groupmode="layer" inkscape:label="Layer 1">
  <g id="progress-bar" stroke-linejoin="round" stroke-opacity=".65882" stroke-width="1.9238">
   <rect id="base" x="10" y="10" width="780" height="30" fill=${this.theme.backgroundColor} rx=${this.theme.cornerRadius} />
   <rect id="progress" x="10" y="10" width=${state} height="30" fill=url(#linearGradient850) rx=${this.theme.cornerRadius} />
  </g>
 </g>
</svg>
        `;
    }
}