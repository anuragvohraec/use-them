import { FormInputBuilder, FormState, FormBloc, InputBuilderConfig } from '../forms';
import { TemplateResult, html } from 'lit-html';
import { UseThemConfiguration } from '../../configs';

export class ToggleButton<F extends FormBloc> extends FormInputBuilder<boolean, F>{
  builder(state: FormState): TemplateResult {
    return html`<style>
    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }
    
    .switch input { 
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: .4s;
      transition: .4s;
    }
    
    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
    }
    
    input:checked + .slider {
      background-color: ${this.theme.toggleButtonOnColor};
    }
    
    input:focus + .slider {
      box-shadow: 0 0 1px ${this.theme.toggleButtonOnColor};
    }
    
    input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
    
    /* Rounded sliders */
    .slider.round {
      border-radius: 34px;
    }
    
    .slider.round:before {
      border-radius: 50%;
    }
    </style>
    <label class="switch" @click=${this.toggle}>
      <input type="checkbox" ?checked=${state[this.config.name]}>
      <span class="slider round"></span>
    </label>
    `;
  }

  toggle=(e:Event)=>{
      e.preventDefault();
      let t = this.shadowRoot?.querySelector("label > input[type=checkbox]") as HTMLInputElement;
      let currentState:boolean = t.checked;
      t.checked = !currentState;
      this.hasChanged(!currentState);
      return false;
  }

  constructor(config:InputBuilderConfig){
    super(config);
  }
} 

// export class ToggleButtonOld<F extends FormBloc> extends FormInputBuilder<boolean, F>{
//   private value: boolean=false;

//     _ON_animate=()=>{
//         //@ts-ignore
//         this.shadowRoot.querySelector("#on_switch_color").beginElement();
//         //@ts-ignore
//         this.shadowRoot.querySelector("#on_base_move").beginElement();
//     }
//     _OFF_animate=()=>{
//         //@ts-ignore
//         this.shadowRoot.querySelector("#off_switch_color").beginElement();
//         //@ts-ignore
//         this.shadowRoot.querySelector("#off_base_move").beginElement();
//     }

//     toggle=()=>{
//       if(!this.disabled){
//         if(this.value){
//           this._OFF_animate(); 
//         }else{
//           this._ON_animate(); 
//         }
//         navigator.vibrate(UseThemConfiguration.PRESS_VIB);
//         this.value= !this.value;
//         this.hasChanged!(this.value);
//       }
//     }

//     builder(state: FormState): TemplateResult {
//       let inputCircleColor = this.disabled?this.theme.backgroundColor:"#ffffff";
//         return html`
// <svg @click=${this.toggle}
//  xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
//  xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" 
//  width="12mm" height="8mm" version="1.1" id="svg21" viewBox="0 0 170 90" preserveAspectRatio="xMidYMid" 
//  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:anigen="http://www.anigen.org/namespace"
//   anigen:version="0.8.1">
//   <defs id="defs15">
//     <linearGradient id="linearGradient850" x1="-28.773" x2="119.68" y1="53.936" y2="50.846" gradientUnits="userSpaceOnUse">
//         <stop stop-color=${this.theme.secondaryColor} offset="0"></stop>
//         <stop stop-color=${this.theme.primaryColor} offset="1"></stop>
//     </linearGradient>
//     <filter id="filter915" color-interpolation-filters="sRGB">
//       <feFlood flood-color="rgb(0,0,0)" flood-opacity=".41176" result="flood" id="feFlood4"></feFlood>
//       <feComposite in="flood" in2="SourceGraphic" operator="in" result="composite1" id="feComposite6"></feComposite>
//       <feGaussianBlur in="composite1" result="blur" stdDeviation="16.1038" id="feGaussianBlur8"></feGaussianBlur>
//       <feOffset dx="1.6" dy="1.8" result="offset" id="feOffset10"></feOffset>
//       <feComposite in="SourceGraphic" in2="offset" result="composite2" id="feComposite12"></feComposite>
//     </filter>
//   </defs>
//   <g id="base-animation">
//     <rect id="toggle-button-base" x="3.6e-07" y="1.3968" width="167.37" height="83.685997" rx="39.641998" ry="41.841999" fill="${this.theme.input_bg_color}" stroke-linejoin="round" stroke-opacity="0.65882" stroke-width="0.42366">
//       <animate attributeType="auto" attributeName="fill" values="${this.theme.input_bg_color};${this.theme.primaryColor}" calcMode="spline" keyTimes="0;1" keySplines="0 0 1 1" dur="0.2s" begin="indefinite" 
//       repeatCount="1" additive="replace" accumulate="none" fill="freeze" id="on_switch_color"></animate>
//       <animate attributeType="auto" attributeName="fill" values="${this.theme.primaryColor};${this.theme.input_bg_color}" calcMode="spline" keyTimes="0;1" keySplines="0 0 1 1" dur="0.2s" begin="indefinite" 
//       repeatCount="1" additive="replace" accumulate="none" fill="freeze" id="off_switch_color"></animate>
//     </rect>
//   </g>
//   <g id="switch-animation">
//     <circle id="switch" transform="matrix(0.28025,0,0,0.28025,53.809,1.3968)" cx="250.24001" cy="148.7" r="128.07001" fill="${inputCircleColor}" filter="url(#filter915)" stroke-linejoin="round" stroke-opacity="0.65882" stroke-width="2.0532"></circle>
//   <animateTransform attributeName="transform" attributeType="auto" type="translate" values="0 0;-81.68950659534471 0" calcMode="spline" keyTimes="0;1" 
//   keySplines="0 0 1 1" dur="0.2s" begin="indefinite" repeatCount="1" additive="replace" accumulate="none" fill="freeze" id="on_base_move"></animateTransform>
//   <animateTransform attributeName="transform" attributeType="auto" type="translate" values="0 0;81.68950659534471 0" calcMode="spline" keyTimes="0;1" 
//   keySplines="0 0 1 1" dur="0.2s" begin="indefinite" repeatCount="1" additive="sum" accumulate="none" fill="freeze" id="off_base_move"></animateTransform>
//   </g>
// </svg>
//         `;
//     }
//     constructor(config:InputBuilderConfig){
//         super(config);
//     }
// }