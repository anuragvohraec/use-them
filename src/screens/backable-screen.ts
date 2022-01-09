import { BlocsProvider } from 'bloc-them';
import { TemplateResult,html } from 'lit-html';
import { AppPageBloc, RouteState } from '../widgets/route-them/RouteThem';
import { WidgetBuilder , NoBlocWidgetBuilder} from "../utils/blocs";
import { UseThemConfiguration } from '../configs';

class TitleBarWithBackButton extends WidgetBuilder<AppPageBloc,RouteState>{

    builder(state: RouteState): TemplateResult {
        return html`<div style="height: 60px;">
        <lay-them in="stack">
            <div style="width:100%;height:100%;">
                <slot name="appbar-bg">
                    <svg version="1.1" viewBox="0 0 100 100" preserveAspectRatio="none" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <defs>
                            <linearGradient id="linearGradient850" x1="-28.773" x2="119.68" y1="53.936" y2="50.846" gradientUnits="userSpaceOnUse">
                                <stop stop-color="${this.theme.secondaryColor}" offset="0"></stop>
                                <stop stop-color="${this.theme.primaryColor}" offset="1"></stop>
                            </linearGradient>
                        </defs>
                        <rect width="100" height="100" fill="url(#linearGradient850)" stroke-linejoin="round" stroke-width="2.1354"></rect>
                    </svg>
                </slot>
            </div>
            <div style="width:100%;height:100%;">
                <lay-them in="row" ma="flex-start" ca="stretch">
                    <div @click=${()=>{
                        let routeBloc = BlocsProvider.of<AppPageBloc>("AppPageBloc",this);
                        routeBloc!.popOutOfCurrentPage();
                    }}>
                        <lay-them ma="center" ca="center">
                            <div style="padding: 0px 10px;"><ut-icon icon="chevron-left" use="icon_inactive: #fff;"></ut-icon></div>
                        </lay-them>
                    </div>
                    <div style="flex:1;">
                        <lay-them in="row" ca="center" ma="flex-start">
                            <ut-p use="color: white;">${this.title}</ut-p>
                        </lay-them>
                    </div>
                </lay-them>
            </div>
        </lay-them>
    </div>`;
    }
    constructor(){
        super("AppPageBloc");
    }
}
if(!customElements.get("title-bar-with-back-button")){
    customElements.define("title-bar-with-back-button",TitleBarWithBackButton);
}

export class BackableScreen extends NoBlocWidgetBuilder{
    
    builder(state: number): TemplateResult {
        return html`<lay-them in="column" ma="flex-start" ca="stretch" overflow="hidden">
            <title-bar-with-back-button title=${this.title} use=${this.getAttribute("use")!} style="box-shadow: 0px 0px 4px;z-index: 2;"></title-bar-with-back-button>
            <div class="body" style="flex: 1 1 auto;">
                <slot></slot>
            </div>
        </lay-them>`;
    }
}
if(!customElements.get("backable-screen")){
    customElements.define("backable-screen",BackableScreen);
}