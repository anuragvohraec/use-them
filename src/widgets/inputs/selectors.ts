import { Bloc } from "bloc-them";
import { html, TemplateResult } from 'lit-html';
import { WidgetBuilder } from '../../utils/blocs';
import {repeat} from 'lit-html/directives/repeat.js';

enum SelectorStatus{
    LOADING,
    LOADED
}

interface SelectorState<I>{
    listOfItems:I[];
    status: SelectorStatus;
    last_item_interactedWith?:I;
}

export abstract class SelectorBloc<I> extends Bloc<SelectorState<I>>{
    private _selectedItems : Set<I>=new Set<I>();

    
    public get selectedItems() : Set<I> {
        return this._selectedItems;
    }
    

    /**
     * value less than or equal to 0 are considered as many selection as possible.
     * for values >0 , the number of selections possible is restricted.
     */
    protected abstract maxNumberOfSelect:number;

    constructor(){
        super({
            listOfItems:[],
            status: SelectorStatus.LOADING
        });
        this._initialize();
    }

    private async _initialize(){
        try{
            const l = await this.loadItems();
            this.emit({listOfItems:l,status: SelectorStatus.LOADED});
            return true;
        }catch(e){
            console.error(e);
            return false;
        }
    }

    /**
     * 
     */
    abstract async loadItems():Promise<I[]>;

    _toggleItemSelection(item:I){
        this._isItemSelected(item)?this._selectedItems.delete(item):this._selectedItems.add(item);
        this.emit({...this.state, last_item_interactedWith: item});
    }

    _isItemSelected(item:I):boolean{
        return this._selectedItems.has(item);
    }
}


export abstract class SelectorWidget<I> extends WidgetBuilder<SelectorBloc<I>, SelectorState<I>>{
    constructor(selectorBlocName:string){
        super(selectorBlocName);
    }

    protected abstract itemBuilder(item:I, index:number, isSelected:boolean):TemplateResult;

    private _itemBuilder(item:I, index:number,isSelected:boolean):TemplateResult{
        return html`<div @touchstart=${(e:TouchEvent)=>{
            this.bloc?._toggleItemSelection(item);
        }} class=${this.bloc?._isItemSelected(item)?"selected":""}>
            ${this.itemBuilder(item,index, this.bloc!._isItemSelected(item))}
        </div>`;
    }

    protected abstract itemToKey(item:I):string;

    private selectedColor(){
        const t = this.useAttribute?.["selection-color"]||this.theme.selector_item_selection_color;
        return t;
    }

    builder(state: SelectorState<I>): TemplateResult {
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