import { Bloc } from 'bloc-them';
import { TemplateResult, html } from 'lit-html';
import { WidgetBuilder } from '../utils/blocs';
import 'lay-them';

export interface ScaffoldState {
    showMenu: boolean;
    showSnackbar: boolean;
    snackBarMessage?: string;
}

export class ScaffoldBloc extends Bloc<ScaffoldState>{
    constructor() {
        super({
            showMenu: false,
            showSnackbar: false
        });
    }

    toggleMenu() {
        let newState = { ...this.state };
        newState.showMenu = !newState.showMenu;
        this.emit(newState);
    }

    /**
     * 
     * @param message : message
     * @param timeout : in milliseconds
     */
    postMessageToSnackBar(message: string, timeout: number = 2000) {
        let newState = { ...this.state };
        newState.showSnackbar = true;
        newState.snackBarMessage = message;
        this.emit(newState);
        setTimeout(() => {
            let newState = { ...this.state };
            newState.showSnackbar = false;
            newState.snackBarMessage = undefined;
            this.emit(newState);
        }, timeout);
    }
}


export class ScaffoldBuilder extends WidgetBuilder<ScaffoldBloc, ScaffoldState>{
    constructor() {
        super(ScaffoldBloc, {
            useThisBloc: new ScaffoldBloc()
        });
    }

    builder(state: ScaffoldState): TemplateResult {
        return html`
        <!-- TODO menu bar-->
        <style>
            .appbar {
                height: 150px;
                width: 100%;
            }
        </style>
<lay-them for="scaffold">
    <div class="appbar">
        <lay-them in="stack">
            <div style="height: 150px; position: fixed; width: 100%">
                <svg version="1.1" viewBox="0 0 100 100" preserveAspectRatio="none" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <defs>
                        <linearGradient id="linearGradient850" x1="-28.773" x2="119.68" y1="53.936" y2="50.846" gradientUnits="userSpaceOnUse">
                            <stop stop-color="${this.theme.secondaryColor}" offset="0"></stop>
                            <stop stop-color="${this.theme.primaryColor}" offset="1"></stop>
                        </linearGradient>
                    </defs>
                    <rect width="100" height="100" fill="url(#linearGradient850)" stroke-linejoin="round" stroke-width="2.1354"></rect>
                </svg>
            </div>
            <div>
                <slot name="title"></slot>
            </div>
            <div style="position: absolute; left : 10px;">
                <ut-scaffold-menu-button></ut-scaffold-menu-button>
            </div>
       </lay-them>
    </div>
    <div class="body">
        <slot name="body"></slot>
    </div>
</lay-them>
        `;
    }

}

customElements.define("ut-scaffold", ScaffoldBuilder);

class MenuButton extends WidgetBuilder<ScaffoldBloc, ScaffoldState>{
    constructor() {
        super(ScaffoldBloc);
    }

    _animateIcon=()=>{ 
        //@ts-ignore
        this.shadowRoot.querySelector("#animateTransform5322").beginElement();
    }

    builder(state: ScaffoldState): TemplateResult {
        return html`<svg
        width="25mm"
        height="25mm"
        viewBox="0 0 25 25"
        version="1.1"
        id="svg845"
        preserveAspectRatio="xMidYMid"
        anigen:version="0.8.1"
        @click=${this._animateIcon}>
        <g
            id="icon"
            transform="translate(-1.5748032e-7,1.4999999)"
            onclick="">
            <rect
            style="fill:#000000;stroke-width:1.92378;stroke-linejoin:round;stroke-opacity:0.658819"
            id="rect835"
            width="15"
            height="2"
            x="5"
            y="5" />
            <rect
            style="fill:#000000;stroke-width:1.92378;stroke-linejoin:round;stroke-opacity:0.658819"
            id="rect837"
            width="15"
            height="2"
            x="5"
            y="10" />
            <rect
            style="fill:#000000;stroke-width:1.92378;stroke-linejoin:round;stroke-opacity:0.658819"
            id="rect839"
            width="15"
            height="2"
            x="5"
            y="15" />
            <animateTransform
            attributeName="transform"
            attributeType="auto"
            type="rotate"
            values="0 12.50589307470144 10.997459956419888;180 12.50589307470144 10.997459956419888"
            calcMode="spline"
            keyTimes="0;1"
            keySplines="0 0 1 1"
            dur="0.3s"
            begin="indefinite"
            repeatCount="1"
            additive="sum"
            accumulate="none"
            fill="freeze"
            id="animateTransform5322" />
        </g>
        </svg>`;
    }
}

customElements.define("ut-scaffold-menu-button", MenuButton);