import { Bloc, BlocsProvider } from "bloc-them";
import { html, TemplateResult,repeat,unsafeHTML } from 'bloc-them';
import { WidgetBuilder } from '../utils/blocs';

import { HideBloc } from "./dialogues";
import { FormBloc, FormMessageBloc, PostValidationOnChangeFunction, ValidatorFunction } from "./forms";
import { SingleLineInput } from "./inputs/textinputs";

import { UseThemConfiguration } from "../configs";
import { AppPageBloc } from "./route-them/RouteThem";

enum SelectorStatus{
    LOADING,
    LOADED
}

type I = Record<string,any>;

export interface SelectorState{
    listOfItems:I[];
    status: SelectorStatus;
    last_item_interactedWith?:I;
}

export interface FilterFunctionForSearchSelector{
    (fullListOfItemLoadedInitially: I[], search: string, key: string): I[]
}

export abstract class SelectorBloc extends Bloc<SelectorState>{
    private _selectedItems : Set<I>=new Set<I>();
    protected fullListOfItemLoadedInitially?: I[];
    protected currentListOfItems?:I[];
    
    public get selectedItems() : Set<I> {
        return this._selectedItems;
    }
    

    /**
     * value less than or equal to 0 are considered as many selection as possible.
     * for values >0 , the number of selections possible is restricted.
     */
    protected abstract maxNumberOfSelect:number;

    constructor(protected call_onchange_on_selection:boolean=true, private filterFunctionForSearchSelector:FilterFunctionForSearchSelector=SelectorBloc.SearchItemByStringMatch){
        super({
            listOfItems:[],
            status: SelectorStatus.LOADING
        });

        setTimeout(()=>{
            this.reloadItems();
        })
    }

    async reloadItems(){
        const e = await this.loadItems();
        this.initialize(e);
    }

    initialize(items:I[]){
        try{
            this.fullListOfItemLoadedInitially = items;
            this.currentListOfItems=this.fullListOfItemLoadedInitially;
            this.emit({listOfItems:this.currentListOfItems,status: SelectorStatus.LOADED});
            return true;
        }catch(e){
            console.error(e);
            return false;
        }
    }

    /**
     * 
     */
    abstract loadItems():Promise<I[]>;

    _toggleItemSelection(item:I,context:HTMLElement,skip_onchange:boolean=false){
        navigator.vibrate(UseThemConfiguration.PRESS_VIB);
        this._isItemSelected(item)?this._selectedItems.delete(item):this._selectedItems.add(item);
        this.emit({...this.state, last_item_interactedWith: item});
        if(!skip_onchange && this.call_onchange_on_selection){
            this.onchange(this._selectedItems,context);
        } 
    }

    abstract onchange(selectedItems : Set<I>, context:HTMLElement):void;

    _isItemSelected(item:I):boolean{
        return this._selectedItems.has(item);
    }

    get _isMaxItemSelected():boolean{
        if(this.maxNumberOfSelect<=0){
            return false;
        }else if(this._selectedItems.size<this.maxNumberOfSelect){
            return false;
        }
        return true;
    }

    _removeFirst(context:HTMLElement){
        let c =0;
        for(let s of this._selectedItems){
            if(c<1){
                this._toggleItemSelection(s,context,true);
            }else{
                break;
            }
            c++;
        }
    }

    unselectAll(){
        this._selectedItems.clear();
        this.emit({...this.state,last_item_interactedWith:undefined})
    }

    /**
     * Post change to on change function, unselects all element after this
     */
    post_change(){
        this.onchange(this._selectedItems,this.hostElement);
        this.state.listOfItems=this.fullListOfItemLoadedInitially!;
        this.unselectAll();
    }

    /**
     * Cancel selection and unselects all element after this
     */
    cancel(){
        this.onchange(new Set<I>(),this.hostElement);
        this.state.listOfItems=this.fullListOfItemLoadedInitially!;
        this.unselectAll();
    }

    find(search:string,key:string){
        if(!search || search.trim().length===0){
            this.emit({...this.state,listOfItems: this.fullListOfItemLoadedInitially!})
        }else{
            let listOfItems = this.filterFunctionForSearchSelector(this.fullListOfItemLoadedInitially??[],search,key);

            this.emit({...this.state, listOfItems});
        }
    }

    static SearchItemByStringMatch(fullListOfItemLoadedInitially:I[], search: string, key: string) {
        let r = new RegExp(search, "i");
        let listOfItems = fullListOfItemLoadedInitially?.filter(e => r.test(e[key] as string)) ?? [];
        return listOfItems;
    }
}


export abstract class SelectorWidget extends WidgetBuilder<SelectorBloc, SelectorState>{
    constructor(selectorBlocName:string){
        super(selectorBlocName);
    }

    protected abstract itemBuilder(item:I, index:number, isSelected:boolean):TemplateResult;

    private _itemBuilder(item:I, index:number,isSelected:boolean):TemplateResult{
        const maxItemSelected = this.bloc!._isMaxItemSelected;
        return html`<div @click=${(e:Event)=>{
            if(maxItemSelected){
                this.bloc?._removeFirst(this);   
            }
            this.bloc?._toggleItemSelection(item,this);
        }} class=${isSelected?"item selected":"item"}>
            ${this.itemBuilder(item,index, this.bloc!._isItemSelected(item))}
        </div>`;
    }

    protected abstract itemToKey(item:I):string;

    private selectedColor(){
        const t = this.useAttribute?.["selection-color"]||this.theme.selector_item_selection_color;
        return t;
    }

    builder(state: SelectorState): TemplateResult {
        switch (state.status) {
            case SelectorStatus.LOADING:{
                return html`<lay-them ma="center" ca="center"><div><circular-progress-indicator></circular-progress-indicator></div></lay-them>`;
            };
            case SelectorStatus.LOADED: {
                return html`
                <style>
                    .selected{
                        background-color: ${this.selectedColor()};
                        color:white;
                    }
                </style>
                <lay-them in="column" ma="flex-start" ca="stretch">
                ${repeat(state.listOfItems,(item:I)=>{
                    return `${this.bloc?._isItemSelected(item)}_${this.itemToKey(item)}`;
                },(item:I,index:number)=>{
                    return this._itemBuilder(item,index,this.bloc!._isItemSelected(item));
                })}
            </lay-them>`;
            }
        }
    }
}

export abstract class SelectorWidgetGrid extends WidgetBuilder<SelectorBloc, SelectorState>{
    constructor(selectorBlocName:string){
        super(selectorBlocName);
    }

    protected abstract itemBuilder(item:I, index:number, isSelected:boolean):TemplateResult;

    private _itemBuilder(item:I, index:number,isSelected:boolean):TemplateResult{
        const maxItemSelected = this.bloc!._isMaxItemSelected;
        return html`<div @click=${(e:Event)=>{
            if(maxItemSelected){
                this.bloc?._removeFirst(this);   
            }
            this.bloc?._toggleItemSelection(item,this);
        }} class=${isSelected?"selected":""}>
            ${this.itemBuilder(item,index, this.bloc!._isItemSelected(item))}
        </div>`;
    }

    protected abstract itemToKey(item:I):string;

    private selectedColor(){
        const t = this.useAttribute?.["selection-color"]||this.theme.selector_item_selection_color;
        return t;
    }

    builder(state: SelectorState): TemplateResult {
        switch (state.status) {
            case SelectorStatus.LOADING:{
                return html`<lay-them ma="center" ca="center"><div><circular-progress-indicator></circular-progress-indicator></div></lay-them>`;
            };
            case SelectorStatus.LOADED: {
                return html`
                <style>
                    .selected{
                        background-color: ${this.selectedColor()};
                    }
                </style>
                <lay-them in="row" ma="flex-start" wrap="wrap">
                    ${repeat(state.listOfItems,(item:I)=>{
                        return `${this.bloc?._isItemSelected(item)}_${this.itemToKey(item)}`;
                    },(item:I,index:number)=>{
                        return this._itemBuilder(item,index,this.bloc!._isItemSelected(item));
                    })}
                </lay-them>`;
            }
        }
    }
}

/**
 * Helper class to create searchable popups and backable-screens
 */
 export class CreateSearchableSelector{
    static create(config:{
        id_key_name:string,
        search_key_name:string,
        selector_type:"grid"|"list",
        tag_name:string,
        selector_hide_bloc_name:string,
        maxNumberOfSelect:number,
        loadItemsFunction(): Promise<I[]> ,
        title:string,
        search_placeholder:string,
        itemBuilderFunction(item: I, index: number, isSelected: boolean): TemplateResult,
        onChangeFunction(selectedItems: Set<I>, context: HTMLElement): void,
        onAccept?:Function,
        filterFunctionForSearchSelector?:FilterFunctionForSearchSelector,
        inputmode?:"none"|"decimal"|"numeric"|"tel"|"search"|"email"|"url",
    }, backable_screen_config?:{
        title:string,
        onAccept:Function,
        onCancel:Function
    }){

        class ISelectorBloc extends SelectorBloc{
            protected maxNumberOfSelect: number=config.maxNumberOfSelect;
            loadItems=config.loadItemsFunction;
            onchange=config.onChangeFunction;

            constructor(){
                super(false,config.filterFunctionForSearchSelector);
            }

            protected _name: string="ISelectorBloc"
        }
        
        let t:any;

        if(config.selector_type==="list"){
            t = class ISelectorListWidget extends SelectorWidget{
                constructor(){
                    super("ISelectorBloc")
                }
                itemBuilder=config.itemBuilderFunction;
                itemToKey(item: I): string {
                    return item[config.id_key_name] as string;
                }
            }
        }else{
            t = class ISelectorListWidget extends SelectorWidgetGrid{
                constructor(){
                    super("ISelectorBloc")
                }
                itemBuilder=config.itemBuilderFunction;
                itemToKey(item: I): string {
                    return item[config.id_key_name] as string;
                }
            }
        }
        let selectorTagName=config.tag_name+"-selector-widget";
        if(!customElements.get(selectorTagName)){
            customElements.define(selectorTagName,t);
        }

        class SearchFormBloc extends FormBloc{
            private selectorBloc?: ISelectorBloc;

            constructor(){
                super({})
            }

            validatorFunctionGiver(nameOfInput: string): ValidatorFunction<any> | undefined {
                if(nameOfInput==="search_string"){
                    return (cv:string)=>{
                        if(cv && cv.length>100){
                            return "only_100_char";
                        }
                    }
                }
            }
            postOnChangeFunctionGiver(nameOfInput: string): PostValidationOnChangeFunction<any> | undefined {
                if(!this.selectorBloc){
                    this.selectorBloc=BlocsProvider.search<ISelectorBloc>("ISelectorBloc",this.hostElement);
                }
                if(nameOfInput === "search_string"){
                    return (cv:string,val)=>{
                        this.selectorBloc?.find(cv,config.search_key_name);
                    }
                }
            }
            protected _name: string="SearchFormBloc"
        }

        class SearchInput extends SingleLineInput<SearchFormBloc>{
            constructor(){
                super({
                    bloc_name:"SearchFormBloc",
                    name:"search_string",
                    clearable:true,
                    icon: "search",
                    placeholder: config.search_placeholder,
                    inputmode: config.inputmode
                })
            }
        }
        const searchInputTagName = config.tag_name+"-search-input";
        if(!customElements.get(searchInputTagName)){
            customElements.define(searchInputTagName,SearchInput)
        }

        class SearchableSelector extends WidgetBuilder<HideBloc,boolean>{
            private _items?: I[] | undefined;
            public get items(): I[] | undefined {
                return this._items;
            }
            public set items(value: I[] | undefined) {
                this._items = value;
                if(value){
                    (this.blocbuilderconfig.blocs_map?.["ISelectorBloc"] as ISelectorBloc).initialize(value)
                }
            }
            
            constructor(){
                super(config.selector_hide_bloc_name,{
                    blocs_map:{
                        ISelectorBloc: new ISelectorBloc(),
                        SearchFormBloc: new SearchFormBloc(),
                        FormMessageBloc: new FormMessageBloc()
                    }
                });
            }

            private acceptSelection=(e:Event)=>{
                let s = BlocsProvider.search<ISelectorBloc>("ISelectorBloc",this);
                if(!backable_screen_config){ 
                    config.onAccept?.(s?.selectedItems,this);  
                    this.bloc?.toggle();
                }else{
                    backable_screen_config.onAccept(s?.selectedItems,this);   
                }
                s?.post_change();
            }

            private cancelSelection=(e:Event)=>{
                let s = BlocsProvider.search<ISelectorBloc>("ISelectorBloc",this);
                s?.cancel();
                if(!backable_screen_config){
                    this.bloc?.toggle();
                }else{
                    backable_screen_config.onCancel(this);
                }
            }

            private mainSearchableTemplate():TemplateResult{
                return html`
                <style>
                .title_bar{
                    padding: 10px;color:white;font-size:${this.theme.H2_font_size};background-color:${this.theme.primaryColor};
                    box-shadow: 0px 2px 3px #00000040;
                    z-index: 2;
                }
                .button{
                    height: 40px;
                }
                .items{
                    flex-grow: 1;overflow-y: auto;height: 0px;
                }
                .buttons_area{
                    box-shadow: 0px -1px 3px #00000040;
                }
                .search_input{
                    box-shadow: 0px 2px 3px #00000040;
                    z-index: 1;
                }
                </style>
                <lay-them in="column" ma="flex-start" ca="stretch">
                    ${!backable_screen_config?html`
                    <div class="title_bar">
                        <ut-p use="color:white;">${config.title}</ut-p>
                    </div>
                    `:html``}
                    <div class="search_input">
                        ${unsafeHTML(`<${searchInputTagName}></${searchInputTagName}`)}
                    </div>
                    <div class="items">
                        ${unsafeHTML(`<${selectorTagName}></${selectorTagName}>`)}
                    </div>
                    <div class="buttons_area">
                        <lay-them in="row" ma="flex-start" ca="stretch" overflow="hidden">
                            <div style="flex:1;" class="button" @click=${this.acceptSelection}>
                                <ink-well><lay-them ma="center" ca="center"><ut-icon icon="done"></ut-icon></lay-them></ink-well>
                            </div>
                            <div style="flex:1;" class="button" @click=${this.cancelSelection}>
                                <ink-well><lay-them ma="center" ca="center"><ut-icon icon="clear"></ut-icon></lay-them></ink-well>
                            </div>
                        </lay-them>
                    </div>
                </lay-them>`;
            }

            builder(state: boolean): TemplateResult {
                if(state){
                    return html``;
                }else{
                    if(!backable_screen_config){
                        return html`<style>
                        .fullscreenGlass{
                            position:fixed;
                            width:100%;
                            height: 100%;
                            background-color: ${this.theme.dialogue_bg};
                            z-index: 10;
                            top: 0;
                            left: 0;
                        }
                        .cont{
                            max-width: 95vw;
                            max-height: 95vh;
                            min-height: var(--height-popup,300px);
                            min-width: 300px;
                            background-color: white;
                            border-radius: ${this.theme.cornerRadius};
                            overflow: hidden;
                        }
                        </style>
                        <div class="fullscreenGlass">
                                <lay-them ma="center" ca="center">
                                    <div class="cont">
                                        ${this.mainSearchableTemplate()}
                                    </div>
                                </lay-them>
                        </div>`;
                    }else{
                        return html`<backable-screen title=${backable_screen_config.title}>
                            ${this.mainSearchableTemplate()}
                        </backable-screen>`;
                    }
                }
            }

        }
        if(!customElements.get(config.tag_name)){
            customElements.define(config.tag_name,SearchableSelector);
        }
    }
}