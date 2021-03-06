import { BlocsProvider } from "bloc-them";
import { html, TemplateResult } from "lit-html";
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import { UseThemConfiguration } from "../configs";
import { WidgetBuilder } from "../utils/blocs";
import { HideBloc } from "./dialogues";

class InProgressIndicator extends WidgetBuilder<HideBloc,boolean>{
    constructor(){
        super("ProgressBloc")
    }
    builder(state: boolean): TemplateResult {
        if(state){
            return html`<div><slot></slot></div>`;
        }else{
            return html`<lay-them ma="center" ca="center" overflow="hidden"><circular-progress-indicator></circular-progress-indicator></lay-them>`
        }
    }
}
customElements.define("ut-confirmation-dialogue-progress-indicator",InProgressIndicator);

export interface ConfirmationDialogueInfo{
    /**
     * Title of the confirmation dialogue
     */
    title:string;
    /**
     * Message description of what this confirmation is about.
     */
    msg:string;
    /**
     * If supplied this, a text area will be added to confirmation message so user can provide extra info along with confirmation.
     * This will be used as placeholder for that text area.
     */
    user_comments_msg?:string;
}

/**
 * A confirmation dialogue can be created by extending this class. **Do override its constructor.**
 */
export abstract class ConfirmationDialogue extends WidgetBuilder<HideBloc,boolean>{
    protected user_msg?:string;

    /**
     * 
     * @param blocName This will be name of the HideBloc
     * @param confirmationInfo 
     */
    constructor(blocName:string, protected confirmationInfo:ConfirmationDialogueInfo){
        super(blocName,{
            blocs_map:{
                ProgressBloc: new HideBloc()
            }
        });
    }

    show_in_progress=()=>{
        (BlocsProvider.search<HideBloc>("ProgressBloc",this))?.emit(false);
    }

    show_buttons=()=>{
        (BlocsProvider.search<HideBloc>("ProgressBloc",this))?.emit(true);
    }

    /**
     * action to be taken on pressing yes. `HideBlocInstance.toggle` has to be called explicitly in this.
     */
    abstract yesAction:Function;
    /**
     * action to be taken on pressing no. `HideBlocInstance.toggle` has to be called explicitly in this.
     */
    abstract noAction:Function;

    private user_msg_changed=(e:Event)=>{
        const ta:HTMLInputElement = e.target as HTMLInputElement;
        this.user_msg = ta.value;
    }

    builder(state: boolean): TemplateResult {
        if(state){
            return html``;
        }else{
            return html`
            <style>
                .cont{
                    background-color: white;
                    max-width: 300px;
                    border-radius: 4px;
                    overflow: hidden;
                    box-shadow: 0px 0px 4px;
                }
                .button{
                    height: 40px;
                }
                .textAreaBG{
                    background-color: ${this.theme.input_bg_color};border-radius: ${this.theme.cornerRadius};
                    resize: none;width: 100%;height:100%;box-sizing: border-box; min-height: 100px;border:none;outline: none;
                }
            </style>
            <ut-dialogue>
                <div style="width: 100%; height: 100%;">
                    <lay-them ma="center" ca="center">
                        <div class="cont">
                            <lay-them in="column" ma="flex-start" ca="stretch">
                                <div style="padding: 10px;color:white;font-size:${this.theme.H2_font_size};background-color:${this.theme.primaryColor};">${this.confirmationInfo?.title}</div>
                                <div style="padding: 10px;">${unsafeHTML(this.confirmationInfo?.msg)}</div>
                                <slot></slot>
                                ${this.confirmationInfo.user_comments_msg? html`<div style="padding: 10px;">
                                    <textarea class="textAreaBG" @focus=${()=>{navigator.vibrate(UseThemConfiguration.PRESS_VIB);}} placeholder=${this.confirmationInfo.user_comments_msg} @keyup=${this.user_msg_changed} type="text"></textarea>
                                </div>`:html``}
                                <ut-confirmation-dialogue-progress-indicator>
                                    <lay-them in="row" ma="flex-start" ca="stretch" overflow="hidden">
                                        <div style="flex:1;" class="button" @click=${this.yesAction}>
                                            <ink-well><lay-them ma="center" ca="center"><ut-icon icon="done"></ut-icon></lay-them></ink-well>
                                        </div>
                                        <div style="flex:1;" class="button" @click=${this.noAction}>
                                            <ink-well><lay-them ma="center" ca="center"><ut-icon icon="clear"></ut-icon></lay-them></ink-well>
                                        </div>
                                    </lay-them>
                                </ut-confirmation-dialogue-progress-indicator>
                            </lay-them>
                        </div>
                    </lay-them>
                </div>
            </ut-dialogue>`;
        }
        
    }
}