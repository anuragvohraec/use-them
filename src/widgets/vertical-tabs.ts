import { Bloc, BlocsProvider } from "bloc-them";
import { html, TemplateResult } from "lit-html"
import { repeat } from "lit-html/directives/repeat";
import { WidgetBuilder } from "../utils/blocs";

type BuilderFunction=(tab_name:string)=>TemplateResult;

export class GenerateVerticalTabs{
    static create(config:{
        tag_name:string;
        tabs_name_icon:string[],
        builder_function:BuilderFunction
    }){
        class TagChangeBloc extends Bloc<string>{
            protected _name: string="TagChangeBloc";

            constructor(){
                super(config.tabs_name_icon[0]);
            }

            changeTab(tab_name:string){
                this.emit(tab_name);
            }
        }

        class TabsWidget extends WidgetBuilder<TagChangeBloc,string>{
            constructor(){
                super("TagChangeBloc",{
                    blocs_map:{
                        TagChangeBloc: new TagChangeBloc()
                    }
                })
            }
            goToTab =(e:Event)=>{
                let t = e.currentTarget as HTMLElement;
                let tab_name = t.getAttribute("tab_name");
                if(tab_name){
                    this.bloc?.changeTab(tab_name);
                }
            }

            builder(state: string): TemplateResult {
                return html`
                <style>
                    .vtxt{
                        /* writing-mode: vertical-lr;
                        text-orientation: upright; */
                        writing-mode: vertical-rl;text-orientation: mixed;
                    }
                    .tab{
                       padding: 10px;
                       background: ${this.theme.vTab_inactiveColor};
                    }
                    .selected{
                        background-color: ${this.theme.vTab_activeColor};
                    }
                    .tab-body{
                        flex:1;
                    }
                    .tab-headers{
                        height:100%;
                    }
                </style>
                <lay-them in="row" ma="flex-start" ca="stretch">
                        <div class="tab-body">
                            ${config.builder_function(state)}
                        </div>
                        <div class="tab-headers">
                            <lay-them in="column" ma="flex-start">
                                ${repeat(config.tabs_name_icon,(i)=>i,(item, index)=>{
                                    return html`
                                    <ink-well tab_name=${item}  @click=${this.goToTab}>
                                        <div class=${state===item?"tab selected":"tab"}>
                                            <div>
                                                <ut-icon icon=${item} use="icon_inactive:${state===item?this.theme.vTab_active_icon_color:this.theme.vTab_inactive_icon_color};"></ut-icon>
                                            </div>
                                            <div class="vtxt">
                                                ${item.toUpperCase()}
                                            </div>
                                        </div>
                                    </ink-well>`;
                                })}
                            </lay-them>
                        </div>
                </lay-them>`;
            }
        }
        customElements.define(config.tag_name,TabsWidget);
    }
}