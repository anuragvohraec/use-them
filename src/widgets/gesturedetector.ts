import { Bloc, BlocsProvider } from 'bloc-them';
import { html, TemplateResult } from 'lit-html';
import {WidgetBuilder} from '../utils/blocs.js';

export enum GESTURE{
    NO_ACTION,//0
    TAP,//1
    SWIPE_LEFT,//2
    SWIPE_RIGHT,//3
    SWIPE_UP,//4
    SWIPE_DOWN,//5
    DOUBLE_TAP
}

/**
 * Swipe Horizontal is given preference over Vertical swipe.
 */
export class GestureDetectorBloc extends Bloc<GESTURE>{
    protected _name: string="GestureDetectorBloc";

    private isDragging: boolean=false;


    /**
     * X position at start of touch
     */
    private _posStartX: number= -1;
    /**
     * X position at end of touch
     */
    private _posStartY: number= -1;

    private _posEndX: number= -1;
    private _posEndY: number= -1;

    private _posCurrX:number =-1;
    private _posCurrY:number =-1;
    private _clickTimer:any;
    
    onStart(posX:number, posY:number){
        this._posStartX = posX;
        this._posStartY= posY;
    }
    
    onMove(posX:number, posY:number){
        this.isDragging = true;
        this._posCurrX = posX;
        this._posCurrY= posY;
    }

    onEnd(posX:number, posY:number){
        this._posEndX = posX;
        this._posEndY= posY;

        if(!this.isDragging){
            if(!this._clickTimer){
                this._clickTimer = setTimeout(()=>{
                    this._clickTimer=undefined;
                    this.emit(GESTURE.TAP);
                },this.doubleTapTimer);
            }else{
                clearTimeout(this._clickTimer);
                this._clickTimer=undefined;
                this.emit(GESTURE.DOUBLE_TAP);
            }
        }else{
            this.isDragging=false;
            //need to resolve to other gestures in here
            let h = (this._posEndX- this._posStartX)*this.drag_sensitivity;
            let v = (this._posEndY- this._posStartY)*this.drag_sensitivity;
            
            if(Math.abs(h)>=Math.abs(v)){
                //horizontal movement
                if(h>0){
                    //right movement
                    if(Math.abs(h)>this.minDistanceInPx){
                        this.emit(GESTURE.SWIPE_RIGHT)
                    }else{
                        this.emit(GESTURE.NO_ACTION);
                    }
                }else{
                    //left movement
                    if(Math.abs(h)>this.minDistanceInPx){
                        this.emit(GESTURE.SWIPE_LEFT)
                    }else{
                        this.emit(GESTURE.NO_ACTION);
                    }
                }
            }else{
                //vertical movement
                if(v>0){
                    //up movement
                    if(Math.abs(v)>this.minDistanceInPx){
                        this.emit(GESTURE.SWIPE_DOWN)
                    }else{
                        this.emit(GESTURE.NO_ACTION);
                    }
                }else{
                    //left movement
                    if(Math.abs(v)>this.minDistanceInPx){
                        this.emit(GESTURE.SWIPE_UP)
                    }else{
                        this.emit(GESTURE.NO_ACTION);
                    }
                }
            }
        }
    }

    /**
     * 
     * @param drag_sensitivity number between 0 to 1, its ration of start to current distance.
     */
    constructor(private drag_sensitivity:number, private minDistanceInPx:number, private doubleTapTimer:number){
        super(GESTURE.NO_ACTION)
        if(drag_sensitivity>1){
            drag_sensitivity=1
        }else if(drag_sensitivity<0){
            drag_sensitivity = 0;
        }
        if(minDistanceInPx<0){
            this.minDistanceInPx=Math.abs(minDistanceInPx);
        }
    }
    

}

export abstract class GestureDetectorBuilder extends WidgetBuilder<GestureDetectorBloc,GESTURE>{
    constructor(private drag_sensitivity:number = 1, private minDistanceInPx:number=100, private doubleTapTimer:number=300){
        super("GestureDetectorBloc",{
            useThisBloc: new GestureDetectorBloc(drag_sensitivity, minDistanceInPx, doubleTapTimer),
            buildWhen:(o,n)=>{
                if(n === GESTURE.NO_ACTION){
                    return false;
                }else{
                    return true;
                }
            }
        })
    }

    handle_touch_start=(e:TouchEvent)=>{
        e.stopPropagation();
        this.bloc?.onStart(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
    };

    handle_touch_end=(e:TouchEvent)=>{
        e.stopPropagation();
        this.bloc?.onEnd(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
    }

    handle_touch_move=(e:TouchEvent)=>{
        e.stopPropagation();
        this.bloc?.onMove(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
    }

    connectedCallback(){
        super.connectedCallback();
        this.addEventListener("touchstart",this.handle_touch_start,false);
        this.addEventListener("touchend",this.handle_touch_end,false);
        this.addEventListener("touchmove",this.handle_touch_move,false);
    }

    disconnectedCallback(){
        super.disconnectedCallback();
        this.removeEventListener("touchstart",this.handle_touch_start,false);
        this.removeEventListener("touchend",this.handle_touch_end,false);
        this.removeEventListener("touchmove",this.handle_touch_move,false);
    }
}

export class GestureDetector extends WidgetBuilder<GestureDetectorBloc,GESTURE>{
    constructor(private drag_sensitivity:number = 1, private minDistanceInPx:number=100, private doubleTapTimer:number=300){
        super("GestureDetectorBloc",{
            useThisBloc: new GestureDetectorBloc(drag_sensitivity, minDistanceInPx, doubleTapTimer),
            buildWhen:(o,n)=>{
                if(n === GESTURE.NO_ACTION){
                    return false;
                }else{
                    return true;
                }
            }
        })
    }


    private _onTouchStart = {
        handleEvent: (e:TouchEvent)=>{
            this.bloc?.onStart(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
            e.stopPropagation();
        },
        capture: false
    }

    private _onTouchEnd = {
        handleEvent: (e:TouchEvent)=>{
            this.bloc?.onEnd(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
            e.stopPropagation();
        },
        capture: false
    }

    private _onTouchMove = {
        handleEvent: (e:TouchEvent)=>{
            this.bloc?.onMove(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
            e.stopPropagation();
        },
        capture: false
    }

    builder(state: GESTURE): TemplateResult {
        switch (state) {
            case GESTURE.NO_ACTION: break;
            case GESTURE.TAP: this.onTap();break;
            case GESTURE.SWIPE_LEFT: this.onSwipeLeft();break;
            case GESTURE.SWIPE_RIGHT: this.onSwipeRight();break;
            case GESTURE.SWIPE_UP: this.onSwipeUp();break;
            case GESTURE.SWIPE_DOWN: this.onSwipeDown();break;
            case GESTURE.DOUBLE_TAP: this.onDoubleTap();break;
            default: break;
        }
        return html`<div style="width:100%; height: 100%;" 
        @touchstart=${this._onTouchStart}
        @touchend=${this._onTouchEnd}
        @touchmove=${this._onTouchMove}><slot></slot></div>`;
    }

    onSwipeUp=()=>{}
    onSwipeDown=()=>{}
    onSwipeLeft=()=>{}
    onSwipeRight=()=>{}
    onTap=()=>{}
    onDoubleTap=()=>{}
}



export class CircularCounterBloc extends Bloc<number>{
    protected _name: string="CircularCounterBloc";
    private _current_index:number=0;
    private _max_count:number=0;

    constructor(initState:number=0){
        super(initState);
    }

    setMaxCount(new_max:number){
        this._max_count=new_max;
    }
    
    public get current_index() : number {
        if(this._max_count===0){
            throw "setMaxCount has not been called on : CircularCounterBloc";
        }
        return this._current_index;
    }
    
    public set current_index(v : number) {
        this._current_index = v;
        this.emit(this._current_index);
    }

    increment(){
        if(this.current_index >= this._max_count-1){
            this.current_index=0;
        }else{
            this.current_index++;
        }
    }

    decrement(){
        if(this.current_index <= 0){
            this.current_index = this._max_count-1;
        }else{
            this.current_index--;
        }
    }

}


class SliderGestureDetector extends GestureDetector{
    private _circularCounterBloc? : CircularCounterBloc;
    
    public get circularCounterBloc() : CircularCounterBloc {
        if(!this._circularCounterBloc){
            this._circularCounterBloc = BlocsProvider.of<CircularCounterBloc>("CircularCounterBloc",this);
        }
        return this._circularCounterBloc!;
    }
    

    constructor(){
        super(1,100);
    }

    onSwipeLeft=()=>{
        this.circularCounterBloc.increment();
    }
    
    onSwipeRight=()=>{
        this.circularCounterBloc.decrement();
    }
}
if(!customElements.get("ut-horizontal-circular-slider-gesture-detector")){
    customElements.define("ut-horizontal-circular-slider-gesture-detector",SliderGestureDetector);
}

class UtHorizontalCircularSlider extends BlocsProvider{
    constructor(initCount:number=0){
        super({
            CircularCounterBloc: new CircularCounterBloc(initCount)
        });
    }
    builder(): TemplateResult {
        return html`<ut-horizontal-circular-slider-gesture-detector><slot></slot></ut-horizontal-circular-slider-gesture-detector>`;
    }
}
if(!customElements.get("ut-horizontal-circular-slider")){
    customElements.define("ut-horizontal-circular-slider",UtHorizontalCircularSlider);
}
