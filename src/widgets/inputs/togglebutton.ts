import { FormInputBuilder, FormState, FormBloc, InputBuilderConfig } from '../forms';
import { TemplateResult, html } from 'bloc-them';

export class ToggleButton<F extends FormBloc> extends FormInputBuilder<boolean, F>{
  build(state: FormState): TemplateResult {
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