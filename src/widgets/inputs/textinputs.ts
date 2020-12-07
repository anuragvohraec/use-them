import { FormInputBuilder, FormBloc, FormState } from '../forms';
import { TemplateResult, html } from 'lit-html';
import { BlocType } from 'bloc-them';
import '@polymer/iron-icons';

export class SingleLineInput<F extends FormBloc> extends FormInputBuilder<string,F>{
    builder(state: FormState): TemplateResult {
        return html`
        <style>
            .glass{
                background-color: ${this.theme.input_bg_color};
            }
            .sli-bg{
                width: 100%;
                min-height: ${this.theme.input_height};
                border-radius: ${this.theme.cornerRadius}
            }

            input{
                background: transparent;
                border: none;
                font-size: 40px;
                caret-color: ${this.theme.input_cursor_color};
                color: ${this.theme.input_text_color};
                padding: ${this.theme.input_padding};
                -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
                -moz-box-sizing: border-box;    /* Firefox, other Gecko */
                box-sizing: border-box;
            }
            input:focus{
                outline-width: 0;
            }
            .iconCtrl{
                --iron-icon-height: 80px;
                --iron-icon-width: 80px;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                padding-left: 20px;
            }
        </style>
        <div class="sli-bg glass">
            <lay-them in="row">
                <div class="iconCtrl"><iron-icon icon="search" style="fill: white;"></iron-icon></div>
                <div style="flex: 1">
                    <input class="sli-bg">
                </div>
            </lay-them>
        </div>
        `;
    }
    
    constructor(type: BlocType<F,FormState>){
        super(type);
    }
}