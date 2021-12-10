import {Bloc} from 'bloc-them';
import { TemplateResult,html } from 'lit-html';
import { NoBlocWidgetBuilder, WidgetBuilder } from '../utils/blocs';

export class ProgressBloc extends Bloc<number>{
    protected _name: string="ProgressBloc";

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

    reset(){
        this.emit(0);
        this._completed=false;
    }
}

/**
 * Will listen for progress for the progress bloc from the tree.
 */
export class ProgressBarWidget<PB extends ProgressBloc> extends WidgetBuilder<PB,number>{
    constructor(progressBlocName: string){
        super(progressBlocName);
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

/**
 * Extends this class and provide an extends progress Bloc.
 */
export abstract class ProgressBarBuilder extends WidgetBuilder<ProgressBloc,number>{

    constructor(progressBloc : ProgressBloc, progressBlocName:string){
        super(progressBlocName, {
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


export class CircularProgressIndicator extends NoBlocWidgetBuilder{
    
    builder(state: number): TemplateResult {
        return html`
        <style>
           .pure-material-progress-circular {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    box-sizing: border-box;
    border: none;
    border-radius: 50%;
    padding: 0.25em;
    width: 3em;
    height: 3em;
    color: ${this.theme.primaryColor};
    background-color: transparent;
    font-size: 16px;
    overflow: hidden;
}

.pure-material-progress-circular::-webkit-progress-bar {
    background-color: transparent;
}

/* Indeterminate */
.pure-material-progress-circular:indeterminate {
    -webkit-mask-image: linear-gradient(transparent 50%, black 50%), linear-gradient(to right, transparent 50%, black 50%);
    mask-image: linear-gradient(transparent 50%, black 50%), linear-gradient(to right, transparent 50%, black 50%);
    animation: pure-material-progress-circular 6s infinite cubic-bezier(0.3, 0.6, 1, 1);
}

:-ms-lang(x), .pure-material-progress-circular:indeterminate {
    animation: none;
}

.pure-material-progress-circular:indeterminate::before,
.pure-material-progress-circular:indeterminate::-webkit-progress-value {
    content: "";
    display: block;
    box-sizing: border-box;
    margin-bottom: 0.25em;
    border: solid 0.25em transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    width: 100% !important;
    height: 100%;
    background-color: transparent;
    animation: pure-material-progress-circular-pseudo 0.75s infinite linear alternate;
}

.pure-material-progress-circular:indeterminate::-moz-progress-bar {
    box-sizing: border-box;
    border: solid 0.25em transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    background-color: transparent;
    animation: pure-material-progress-circular-pseudo 0.75s infinite linear alternate;
}

.pure-material-progress-circular:indeterminate::-ms-fill {
    animation-name: -ms-ring;
}

@keyframes pure-material-progress-circular {
    0% {
        transform: rotate(0deg);
    }
    12.5% {
        transform: rotate(180deg);
        animation-timing-function: linear;
    }
    25% {
        transform: rotate(630deg);
    }
    37.5% {
        transform: rotate(810deg);
        animation-timing-function: linear;
    }
    50% {
        transform: rotate(1260deg);
    }
    62.5% {
        transform: rotate(1440deg);
        animation-timing-function: linear;
    }
    75% {
        transform: rotate(1890deg);
    }
    87.5% {
        transform: rotate(2070deg);
        animation-timing-function: linear;
    }
    100% {
        transform: rotate(2520deg);
    }
}

@keyframes pure-material-progress-circular-pseudo {
    0% {
        transform: rotate(-30deg);
    }
    29.4% {
        border-left-color: transparent;
    }
    29.41% {
        border-left-color: currentColor;
    }
    64.7% {
        border-bottom-color: transparent;
    }
    64.71% {
        border-bottom-color: currentColor;
    }
    100% {
        border-left-color: currentColor;
        border-bottom-color: currentColor;
        transform: rotate(225deg);
    }
}
        </style>
        <lay-them ma="center" ca="center" overflow="hidden"><progress class="pure-material-progress-circular"></progress></lay-them>
        `;
    }

}
if(!customElements.get("circular-progress-indicator")){
    customElements.define("circular-progress-indicator",CircularProgressIndicator);
}


class LoadingCell extends NoBlocWidgetBuilder{
    builder(state: number): TemplateResult {
        return html`
    <style>
.load-wraper{
    height: 100%;
    width: 100%;
    overflow: hidden;
}
.activity{
    position: relative;
    left: -45%;
    height: 100%;
    width: 45%;
    background-image: linear-gradient(to left, #fbfbfb0d, #fbfbfb4d, #fbfbfb99, #fbfbfb4d, #fbfbfb0d);
    animation: loading 1s infinite;
}

@keyframes loading {
    0%{
        left: -45%;
    }
    100%{
        left: 100%;
    }
}
    </style>
    <div class="load-wraper">
        <div class="activity"></div>
    </div>`;
    }

}
if(!customElements.get("loading-cell")){
    customElements.define("loading-cell",LoadingCell);
}

class IndeterminateLoadingBar extends NoBlocWidgetBuilder{
    builder(state: number): TemplateResult {
        return html`<style>
.progress-line, .progress-line:before {
  height: 3px;
  width: 100%;
  margin: 0;
}
.progress-line {
  background-color: ${this.theme.primaryColor};
  display: -webkit-flex;
  display: flex;
}
.progress-line:before {
  background-color: ${this.theme.secondaryColor};
  content: '';
  -webkit-animation: running-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  animation: running-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@-webkit-keyframes running-progress {
  0% { margin-left: 0px; margin-right: 100%; }
  50% { margin-left: 25%; margin-right: 0%; }
  100% { margin-left: 100%; margin-right: 0; }
}
@keyframes running-progress {
  0% { margin-left: 0px; margin-right: 100%; }
  50% { margin-left: 25%; margin-right: 0%; }
  100% { margin-left: 100%; margin-right: 0; }
}
        </style>
<div class="progress-line"></div>
        `;
    }
}
if(!customElements.get("ut-indeterminate-loading-bar")){
    customElements.define("ut-indeterminate-loading-bar",IndeterminateLoadingBar);
}