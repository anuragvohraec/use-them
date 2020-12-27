import { BlocType } from 'bloc-them';
import { html, TemplateResult } from 'lit-html';
import { FormBloc, FormInputBuilder, FormState } from '../forms';


export class CheckBox<F extends FormBloc> extends FormInputBuilder<string,F>{
    constructor(type: BlocType<F,FormState>,private checkValue:string,private label:string){
        super(type);
    }

    connectedCallback(){
        super.connectedCallback();

    }
    
    builder(state: FormState): TemplateResult {
        return html`
            <style>
                /* The container */
                .container {
                display: block;
                position: relative;
                padding-left: 35px;
                margin-bottom: 12px;
                cursor: pointer;
                font-size: 22px;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                }

                /* Hide the browser's default checkbox */
                .container input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
                height: 0;
                width: 0;
                }

                /* Create a custom checkbox */
                .checkmark {
                position: absolute;
                top: 0;
                left: 0;
                height: 25px;
                width: 25px;
                background-color:${this.theme.input_check_mark_color};
                }

                /* On mouse-over, add a grey background color */
                .container:hover input ~ .checkmark {
                background-color: #ccc;
                }

                /* When the checkbox is checked, add a blue background */
                .container input:checked ~ .checkmark {
                background-color: ${this.theme.input_checkbox_active_color};
                }

                /* Create the checkmark/indicator (hidden when not checked) */
                .checkmark:after {
                content: "";
                position: absolute;
                display: none;
                }

                /* Show the checkmark when checked */
                .container input:checked ~ .checkmark:after {
                display: block;
                }

                /* Style the checkmark/indicator */
                .container .checkmark:after {
                left: 9px;
                top: 5px;
                width: 5px;
                height: 10px;
                border: solid white;
                border-width: 0 3px 3px 0;
                -webkit-transform: rotate(45deg);
                -ms-transform: rotate(45deg);
                transform: rotate(45deg);
                }
                </style>
            <label class="container">${this.label}
                <input type="checkbox" value="${this.checkValue}" ?disabled=${this.disabled} @change=${this._delegateChange}>
                <span class="checkmark"></span>
            </label>`;
    }

    _delegateChange=(e: InputEvent)=>{
        this.onChange!((e.target as HTMLInputElement).value);
    }

}