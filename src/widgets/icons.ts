import { html, TemplateResult } from 'bloc-them';
import { BogusBloc, WidgetBuilder } from "../utils/blocs";

export class UtIcon extends WidgetBuilder<BogusBloc,number>{
   
    
    constructor(){
        super("BogusBloc",{
            blocs_map:{
                BogusBloc: new BogusBloc()
            }
        })
    }

    builder(state: number): TemplateResult | undefined {
        if(this.hasAttribute("icon")){
            const icon = "#"+this.getAttribute("icon");
            return html`<style>
                .icon {
                    display: inline-block;
                    width: ${this.theme.icon_size??"25px"};
                    height: ${this.theme.icon_size??"25px"};
                    fill: ${this.theme.icon_inactive??"#000"};
                    stroke: ${this.theme.icon_stroke??"#fff0"};
                }
                .icon:active{
                    fill: ${this.theme.icon_active??"#000"};
                }
                .cont1{
                    display: inline-block;
                    width: 100%;
                    height: 100%;
                }
                .cont2{
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            </style>
            <!--Icons usage the xlink ref is the id of the icons-->
            <div class="cont1">
                <div class="cont2">
                    <svg viewBox="0 0 24 24" class="icon">
                        <use href=${icon} />
                    </svg>
                </div>
            </div>`;
        }
    }
}
if(!customElements.get("ut-icon")){
    customElements.define("ut-icon",UtIcon);
}