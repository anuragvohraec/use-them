import { Bloc, findBloc, ListenerWidget } from "bloc-them";
import { html, nothing, TemplateResult } from 'bloc-them';
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
    
    private scrollTabIntoView(id:string){
        let t = this.hostElement?.shadowRoot?.querySelector(`lay-them > div.tabs_bar > ink-well[tab_id='${id}']`);
        t?.scrollIntoView();
    }

    goToNextTab(){
        this.index++;
        if(this.index>this.indexExtent){
            this.index=0;
        }
        let id= this.smartTabConfigs[this.index].id;
        this.scrollTabIntoView(id);
        this.goToTab(id,this.index);
    }

    goToPrevTab(){
        this.index--;
        if(this.index<0){
            this.index=this.indexExtent;
        }
        let id= this.smartTabConfigs[this.index].id;
        this.scrollTabIntoView(id);
        this.goToTab(id,this.index);
    }

    goToTab(id:string,index?:number){
        this.index = index??this.smartTabConfigs.findIndex((e)=>e.id===id);
        this.emit(id);
        this.onTabChangeCallBack?.(id);
    }

    abstract onTabChangeCallBack?(id:string):void
    abstract builderForId(id:string, ctx:WidgetBuilder<string>):TemplateResult
}

class StbGestureDetector extends GestureDetector{
    private stbBloc?:SmartTabsBloc;

    getStbBloc():SmartTabsBloc{
        if(!this.stbBloc){
            this.stbBloc = findBloc<SmartTabsBloc>("STB",this);
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

    constructor(){
        super({});
    }
}
customElements.define("ut-stb-gesture-detector",StbGestureDetector);

abstract class SmartTabsWidgetBuilder<B extends SmartTabsBloc> extends WidgetBuilder<string>{

    goToTab=(e:Event)=>{
        let t = e.currentTarget as HTMLElement & {tab_id:string};
        this.bloc<B>()?.goToTab(t.getAttribute("tab_id")!);
    }

    build(state: string): TemplateResult {
        let tabs_bar = html`
            ${this.bloc<B>()?.smartTabConfigs.map(e=>{
                return html`
                    <ink-well tab_id=${e.id} @click=${this.goToTab}>
                        <div class="tab_icon">
                            <div><ut-icon icon=${e.icon}></ut-icon></div>
                            <div class="tab-text">${state===e.id?html`<ut-h5 .key=${e.label} style="padding-left: 5px;"></ut-h5>`:nothing}</div>
                        </div>
                    </ink-well>
                `;
            })}`;

        let tabContent = this.bloc<B>()!.builderForId(state, this);
        
        return html`<style>
            .tabs_bar{
                height: 50px;
                width: 100%;
                display: flex;
                overflow-x: auto;
            }
            .tab_icon{
                max-height: 50px;
                display: flex;
                align-items: center;
                padding: 10px;
                justify-content: center;
            }
            .tab-text{
                white-space: nowrap;
                max-width: 60vw;
                overflow-x: hidden;
            }
        </style>
        <lay-them in="column" ma="flex-start" ca="stretch">
            <div class="tabs_bar">
                ${tabs_bar}
            </div>
            <div style="flex-grow:1;height:0px;">
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
    (id: string, ctx: WidgetBuilder<string>): TemplateResult;
}

export class SmartTabsBuilder{
    static create(config:{tag_name:string,smartTabConfig:SmartTabsConfig[],builderForIdFunction:BuilderForIDFunction, index?:number, onTabChangeCallBack?:OnTabChangeCallBack, blocs_map?:Record<string, Bloc<any>>}){
        
        class STB extends SmartTabsBloc{
            
            onTabChangeCallBack = config.onTabChangeCallBack;
            
            builderForId=  config.builderForIdFunction;

            protected _name: string="STB"
           
            constructor(){
                super(config.smartTabConfig,config.index);
            }
        }

        let blocs_map:Record<string, Bloc<any>> = {...config.blocs_map};
        blocs_map["STB"]=new STB()

        class StbBuilder extends SmartTabsWidgetBuilder<STB>{
            constructor(){
                super("STB",{
                    ...blocs_map
                })
            }
        }

        if(!customElements.get(config.tag_name)){
            customElements.define(config.tag_name,StbBuilder);
        }
    }
}
