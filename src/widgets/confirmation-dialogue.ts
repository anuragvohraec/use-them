import { html, TemplateResult } from "lit-html";
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import { WidgetBuilder } from "../utils/blocs";
import { HideBloc } from "./dialogues";

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
        super(blocName);
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
            </style>
            <ut-dialogue>
                <div style="width: 100%; height: 100%;">
                    <lay-them ma="center" ca="center">
                        <div class="cont">
                            <lay-them in="column" ma="flex-start" ca="stretch">
                                <div style="padding: 10px;color:white;font-size:${this.theme.H2_font_size};background-color:${this.theme.primaryColor};">${this.confirmationInfo?.title}</div>
                                <div style="padding: 10px;">${unsafeHTML(this.confirmationInfo?.msg)}</div>
                                ${this.confirmationInfo.user_comments_msg? html`<div style="padding: 10px;">
                                    <textarea placeholder=${this.confirmationInfo.user_comments_msg} @keyup=${this.user_msg_changed} style="resize: none;width: 100%;height:100%;border: 1px solid #dcdcdc;box-sizing: border-box; min-height: 100px;" type="text"></textarea>
                                </div>`:html``}
                                <lay-them in="row" ma="flex-start" ca="stretch" overflow="hidden">
                                    <div style="flex:1;" class="button" @click=${this.yesAction}>
                                        <ink-well><lay-them ma="center" ca="center" slot="yes"><ut-icon icon="done"></ut-icon></lay-them></ink-well>
                                    </div>
                                    <div style="flex:1;" class="button" @click=${this.noAction}>
                                        <ink-well><lay-them ma="center" ca="center" slot="no"><ut-icon icon="clear"></ut-icon></lay-them></ink-well>
                                    </div>
                                </lay-them>
                            </lay-them>
                        </div>
                    </lay-them>
                </div>
            </ut-dialogue>`;
        }
        
    }
}