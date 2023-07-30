import { html, TemplateResult } from 'bloc-them';
import { UseThemConfiguration } from '../configs';
import { BogusBloc, WidgetBuilder } from '../utils/blocs';

/**
 * Ripple color can be changed using **use** params to control inkwell: 
 * ripple_color: to control color of ripple
 * 
 * Example: &lt;ink-well use="ripple_color: #6eb9f7;"&gt;&lt;/inkwell&gt;
 */
export class InkWell extends WidgetBuilder<number>{
    private ripple_color:string;
    private ripple_opacity:string;

    constructor(){
        super("BogusBloc",{
            BogusBloc: new BogusBloc()
        });

        let bgColor = "#000";
        let opacity = ".2";
        if(this.useAttribute){
            let bgc =this.useAttribute!["ripple_color"];
            if(bgc){
                bgColor = bgc;
            }
            let op = this.useAttribute!["opacity"];
            if(op){
                opacity=op;
            }
        }
        this.ripple_color=bgColor;
        this.ripple_opacity=opacity;
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

    build(state: number): TemplateResult {
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
    opacity: ${this.ripple_opacity};
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