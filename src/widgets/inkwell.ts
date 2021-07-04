import { html, TemplateResult } from 'lit-html';
import { UseThemConfiguration } from '../configs';
import { BogusBloc, WidgetBuilder } from '../utils/blocs';

/**
 * Ripple color can be changed using **use** params to control inkwell: 
 * ripple_color: to control color of ripple
 * 
 * Example: &lt;ink-well use="ripple_color: #6eb9f7;"&gt;&lt;/inkwell&gt;
 */
export class InkWell extends WidgetBuilder<BogusBloc,number>{
    private ripple_color:string;

    constructor(){
        super("BogusBloc",{useThisBloc:new BogusBloc()});

        let bgColor = "#000";
        if(this.useAttribute){
            let bgc =this.useAttribute!["ripple_color"];
            if(bgc){
                bgColor = bgc;
            }
        }
        this.ripple_color=bgColor;
    }


    /**
     * Override this if you want to have an action on inkwell
     * @param e 
     */
    protected onpressaction(e:Event){

    }


    private _actionOnPress=(e:Event)=>{
        navigator.vibrate(UseThemConfiguration.PRESS_VIB);

        this.onpressaction(e);
    }

    builder(state: number): TemplateResult {
        return html`<style>
        /* Ripple effect */
.ripple {
    position: relative;
  overflow: hidden;
  transform: translate3d(0, 0, 0);
  width:100%;
  height: 100%;
}
.ripple:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, ${this.ripple_color} 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10,10);
    opacity: 0;
    transition: transform .5s, opacity 1s;
}
.ripple:active:after {
    transform: scale(0,0);
    opacity: .2;
    transition: 0s;
}
</style>
<div class="ripple" @click=${{
    handleEvent:(e:Event)=>{
        this._actionOnPress(e);
    },
    capture:false
}}>
<slot></slot>
</div>`;
    }
}
customElements.define("ink-well",InkWell);