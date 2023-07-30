import { Bloc, BlocsProvider } from 'bloc-them';
import { html, TemplateResult } from 'bloc-them';
import { WidgetBuilder} from '../utils/blocs.js';
import {UseThemConfiguration} from "../configs";
import { XY } from '../interfaces.js';

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
            blocs_map:{
                GestureDetectorBloc:new GestureDetectorBloc(drag_sensitivity, minDistanceInPx, doubleTapTimer)
            },
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
    private capture:boolean=false;
    //private drag_sensitivity:number = 1, private minDistanceInPx:number=100, private doubleTapTimer:number=300,private capture:boolean=false
    constructor({drag_sensitivity=1,minDistanceInPx=100,doubleTapTimer=300,capture=false}:  {
        drag_sensitivity?: number | undefined;
        minDistanceInPx?: number | undefined;
        doubleTapTimer?: number | undefined;
        capture?: boolean | undefined;
    }){
        super("GestureDetectorBloc",{
            blocs_map:{
                GestureDetectorBloc: new GestureDetectorBloc(drag_sensitivity, minDistanceInPx, doubleTapTimer)
            },
            buildWhen:(o,n)=>{
                if(n === GESTURE.NO_ACTION){
                    return false;
                }else{
                    return true;
                }
            }
        });
        this.capture =capture;
    }


    private _onTouchStart = {
        handleEvent: (e:TouchEvent)=>{
            this.bloc?.onStart(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
            e.stopPropagation();
        },
        capture: this.capture
    }

    private _onTouchEnd = {
        handleEvent: (e:TouchEvent)=>{
            this.bloc?.onEnd(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
            e.stopPropagation();
        },
        capture: this.capture
    }

    private _onTouchMove = {
        handleEvent: (e:TouchEvent)=>{
            this.bloc?.onMove(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
            e.stopPropagation();
        },
        capture: this.capture
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
            this._circularCounterBloc = CircularCounterBloc.search<CircularCounterBloc>("CircularCounterBloc",this);
        }
        return this._circularCounterBloc!;
    }
    

    constructor(){
        super({});
    }

    onSwipeLeft=()=>{
        navigator.vibrate(UseThemConfiguration.PRESS_VIB);
        this.circularCounterBloc.increment();
    }
    
    onSwipeRight=()=>{
        navigator.vibrate(UseThemConfiguration.PRESS_VIB);
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

export abstract class VerticalScrollLimitDetector extends BlocsProvider{

    private _scroller?:HTMLDivElement|null;

    disconnectedCallback(){
        this._scroller?.removeEventListener("scroll",this._doListenScroll);
    }

    connectedCallback(){
        super.connectedCallback();
    }

    _doListenScroll = {
        handleEvent: (e:Event)=>{
            //@ts-ignore
            let element:HTMLElement = e.target;
            if (element.offsetHeight + element.scrollTop >= element.scrollHeight){
                navigator.vibrate(UseThemConfiguration.PRESS_VIB);
                this.bottomLimitReached();
            }else if(element.scrollTop===0){
                navigator.vibrate(UseThemConfiguration.PRESS_VIB);
                this.topLimitReached();
            }
            e.stopPropagation();
        },
        capture: false
    }
    abstract bottomLimitReached():void;
    abstract topLimitReached():void;

    _discardTouch={
        handleEvent:(e:Event)=>{
            e.stopPropagation();
        },
        capture:false
    }

    builder(): TemplateResult {
    let snap= this.getAttribute("snap");
    return html`<style>
        .con{
            overflow-y:scroll;
            height:100%;
            width:100%;
            scroll-behavior:smooth;
            scroll-snap-type: ${snap?snap:"none"};
        }
        .con::-webkit-scrollbar { 
            display: none;  /* Safari and Chrome */
        }
    </style><div class="con" @scroll=${this._doListenScroll} @touchstart=${this._discardTouch}
        @touchend=${this._discardTouch}
        @touchmove=${this._discardTouch}><slot></slot></div>`;
    }
}

export abstract class HorizontalScrollLimitDetector extends BlocsProvider{
    private _scroller?:HTMLDivElement|null;

    disconnectedCallback(){
        this._scroller?.removeEventListener("scroll",this._doListenScroll);
    }

    connectedCallback(){
        super.connectedCallback();
    }

    _doListenScroll = {
        handleEvent: (e:Event)=>{
            //@ts-ignore
            let element:HTMLElement = e.target;
            if (element.offsetWidth + element.scrollLeft === element.scrollWidth){
                navigator.vibrate(UseThemConfiguration.PRESS_VIB);
                this.rightLimitReached();
            }else if(element.scrollLeft===0){
                navigator.vibrate(UseThemConfiguration.PRESS_VIB);
                this.leftLimitReached();
            }
            e.stopPropagation();
        },
        capture: false
    }
    abstract rightLimitReached():void;
    abstract leftLimitReached():void;

    _discardTouch={
        handleEvent:(e:Event)=>{
            e.stopPropagation();
        },
        capture:false
    }

    builder(): TemplateResult {
    let snap= this.getAttribute("snap");
    return html`<style>
        .con{
            overflow-x:scroll;
            height:100%;
            width:100%;
            display:flex;
            scroll-behavior:smooth;
            scroll-snap-type: ${snap?snap:"none"};
        }
        .con::-webkit-scrollbar { 
            display: none;  /* Safari and Chrome */
        }
    </style><div class="con" @scroll=${this._doListenScroll} @touchstart=${this._discardTouch}
        @touchend=${this._discardTouch}
        @touchmove=${this._discardTouch}><slot></slot></div>`;
    }
}

export abstract class ZoomAndPanBloc extends Bloc<number>{
    /**
     * 
     * @param xy point where double click is done
     */
    abstract onDoublePointTouch(xy:XY):void;

    /**
     * 
     * @param xy Where a single pointing touch is done on screen
     */
    abstract onPointTouch(xy:XY):void;

    abstract onPointRelease(xy:XY):void;

    /**
     * Zoom percentage
     * @param zoom 
     * @param axis 
     */
    abstract onZoom(zoom:number,axis:XY):void;
    /**
     * @param movement differential XY , signifying movement in PX 
     * @param axis 
     */
    abstract onPan(movement:XY,axis:XY):void;
}

class ZoomAndPanWidget extends WidgetBuilder<ZoomAndPanBloc,number>{
    private initDistance:number=0;
    private touch2PointerID?:number;

    private axis:XY={x:0,y:0};

    private tapedOnceTimer:any;

    private handleStart={
        handleEvent:(e:TouchEvent)=>{
            e.stopPropagation();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];

            if(!touch2){
                if(!this.tapedOnceTimer) {
                    this.tapedOnceTimer=setTimeout( ()=>{
                        this.tapedOnceTimer=undefined;
                        this.bloc?.onPointTouch({x:touch1.screenX,y:touch1.screenY});
                    }, UseThemConfiguration.PinchZoomBlocDoubleTapTime );
                }else{
                    clearTimeout(this.tapedOnceTimer);
                    this.tapedOnceTimer=undefined;
                    this.bloc?.onDoublePointTouch({x:touch1.screenX,y:touch1.screenY});
                }
                

                //case of pan
                this.axis.x=touch1.screenX;
                this.axis.y=touch1.screenY;
                this.touch2PointerID=undefined;
            }else{
                let minX=Math.min(touch1.screenX,touch2.screenX);
                let minY=Math.min(touch1.screenY,touch2.screenY)
                this.axis={x:minX+Math.abs(touch1.screenX-touch2.screenX),y:minY+Math.abs(touch1.screenY-touch2.screenY)};

                this.touch2PointerID=touch2.identifier;
                //case of zoom
                this.initDistance = Math.abs(touch1.screenY-touch2.screenY);//this.calculateDistance({x:touch1.screenX,y:touch1.screenY},{x:touch2.screenX,y:touch2.screenY});
            }

            return false;
        },
        capture:true
    }

    calculateDistance1(p1:XY,p2:XY){
        return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y));
    }

    private prevPan?:XY;

    private handleEnd={
        handleEvent:(e:TouchEvent)=>{
           this.init();
           if(e.changedTouches.length===1){
               let touch1=e.changedTouches[0];
               this.bloc?.onPointRelease({x:touch1.screenX,y:touch1.screenY});
           }
        },
        capture:true
    };

    private init(){
        this.initDistance=0;
        this.prevPan=undefined;
        this.touch2PointerID=undefined;
        this.axis={x:0,y:0};
        this.prevZoom=1;
    }

    private prevZoom:number=1;

    private handleMove={
        handleEvent:(e:TouchEvent)=>{
            e.stopPropagation();
            e.preventDefault();
            const touch1 = e.touches[0];
            let touch2:Touch|undefined=undefined;

            if(this.touch2PointerID && e.touches.length==2){
                for(let i=0;i<e.touches.length;i++){
                    if(e.touches[i].identifier===this.touch2PointerID){
                        touch2=e.touches[i];
                        break;
                    }
                }    
            }
            
            if(!touch2){
                const p1={x:touch1.screenX,y:touch1.screenY};
                if(!this.prevPan){
                    this.prevPan=p1;
                }

                //if there is no movement there is no point in calling pan
                if(this.isNotEqual(this.prevPan,p1)){
                    //case for panning
                    this.bloc?.onPan({x:p1.x-this.prevPan!.x,y:p1.y-this.prevPan!.y},this.axis);
                    this.prevPan=p1;
                }
            }else{
                const currentDistance = Math.abs(touch1.screenY-touch2.screenY);//this.calculateDistance({x:touch1.screenX,y:touch1.screenY},{x:touch2.screenX,y:touch2.screenY});
                const zoom=currentDistance/this.initDistance;
                //if zoom has not changed there is no point in calling on zoom
                if(this.prevZoom!==zoom){
                    this.bloc?.onZoom(zoom,this.axis);
                    this.prevZoom=zoom;
                }
            }
            
            return false;
        },
        capture:true
    }

    /**
     * 
     * @param p1 
     * @param p2 
     * @returns 
     */
    private isNotEqual(p1:XY,p2:XY){
        if(p1.x===p2.x && p1.y===p2.y){
            return false;
        }else{
            return true;
        }
    }

    builder(state: number): TemplateResult {
        return html`<div id="target" style="width:100%;height:100%;" @touchstart=${this.handleStart} @touchmove=${this.handleMove} @touchend=${this.handleEnd}><slot></slot></div>`;
    }
}
customElements.define("ut-pan-zoom-detector",ZoomAndPanWidget);