import { Bloc, BlocsProvider } from "bloc-them";
import { html, nothing, TemplateResult } from "lit-html";
import { UseThemConfiguration } from "../configs";
import { WidgetBuilder } from "../utils/blocs";
import { GestureDetector } from "./gesturedetector";

interface SmartTabsConfig{
    label:string;
    icon:string;
    /**
     * Used to refer to tabs
     */
    id:string;
}

export abstract class SmartTabsBloc extends Bloc<string>{ 
    private indexExtent:number;
    constructor(public smartTabConfigs:SmartTabsConfig[],private index:number=0){
        super(smartTabConfigs[index].id);
        this.indexExtent=this.smartTabConfigs.length-1;
    }

    goToNextTab(){
        this.index++;
        if(this.index>this.indexExtent){
            this.index=0;
        }
        this.goToTab(this.smartTabConfigs[this.index].id);
    }

    goToPrevTab(){
        this.index--;
        if(this.index<0){
            this.index=this.indexExtent;
        }
        this.emit(this.smartTabConfigs[this.index].id);
    }

    goToTab(id:string){
        this.index = this.smartTabConfigs.findIndex((e)=>e.id===id);
        this.emit(id);
        this.onTabChangeCallBack?.(id);
    }

    abstract onTabChangeCallBack?(id:string):void
    abstract builderForId(id:string, ctx:WidgetBuilder<SmartTabsBloc,string>):TemplateResult
}

class StbGestureDetector extends GestureDetector{
    private stbBloc?:SmartTabsBloc;

    getStbBloc():SmartTabsBloc{
        if(!this.stbBloc){
            this.stbBloc = BlocsProvider.search<SmartTabsBloc>("STB",this);
        }
        return this.stbBloc!;
    }

    onSwipeLeft=()=>{
        navigator.vibrate(UseThemConfiguration.PRESS_VIB);
        this.getStbBloc().goToNextTab();
    }

    onSwipeRight=()=>{
        navigator.vibrate(UseThemConfiguration.PRESS_VIB);
        this.getStbBloc().goToPrevTab();
    }
}
customElements.define("ut-stb-gesture-detector",StbGestureDetector);

abstract class SmartTabsWidgetBuilder<B extends SmartTabsBloc> extends WidgetBuilder<B,string>{

    goToTab=(e:Event)=>{
        let t = e.currentTarget as HTMLElement & {tab_id:string};
        this.bloc?.goToTab(t.getAttribute("tab_id")!);
    }

    builder(state: string): TemplateResult {
        let tabs_bar = html`<lay-them in="row" ma="flex-start" ca="stretch">
            ${this.bloc?.smartTabConfigs.map(e=>{
                return html`<ink-well tab_id=${e.id} @click=${this.goToTab}>
                    <lay-them ma="center" ca="center">
                        <div class="tab_icon" ><ut-icon icon=${e.icon}></ut-icon>${state===e.id?html`<ut-h5 .key=${e.label} style="padding-left: 5px;"></ut-h5>`:nothing}</div>
                    </lay-them>
                </ink-well>`;
            })}
        </lay-them>`;

        let tabContent = this.bloc!.builderForId(state, this);
        
        return html`<style>
            .tabs_bar{
                height: 50px;
                width: 100%;
            }
            .tab_icon{
                max-height: 50px;
                display: flex;
                align-items: center;
                padding: 10px;
                justify-content: center;
            }
        </style>
        <lay-them in="column" ma="flex-start" ca="stretch">
            <div class="tabs_bar">
                ${tabs_bar}
            </div>
            <div style="flex-grow:1">
                <ut-stb-gesture-detector>
                    ${tabContent}
                </ut-stb-gesture-detector>
            </div>
        </lay-them>
        `;
    }
}

export interface OnTabChangeCallBack{
    (id:string):void;
}

export interface BuilderForIDFunction{
    (id: string, ctx: WidgetBuilder<SmartTabsBloc, string>): TemplateResult;
}

export class SmartTabsBuilder{
    static create(config:{tag_name:string,smartTabConfig:SmartTabsConfig[],builderForIdFunction:BuilderForIDFunction, index?:number, onTabChangeCallBack?:OnTabChangeCallBack}){
        
        class STB extends SmartTabsBloc{
            
            onTabChangeCallBack = config.onTabChangeCallBack;
            
            builderForId=  config.builderForIdFunction;

            protected _name: string="STB"
           
            constructor(){
                super(config.smartTabConfig,config.index);
            }
        }

        class StbBuilder extends SmartTabsWidgetBuilder<STB>{
            constructor(){
                super("STB",{
                    blocs_map:{
                        STB: new STB()
                    }
                })
            }
        }

        if(!customElements.get(config.tag_name)){
            customElements.define(config.tag_name,StbBuilder);
        }
    }
}
