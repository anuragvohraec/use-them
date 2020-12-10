import { Bloc } from 'bloc-them';
import { html, TemplateResult } from 'lit-html';
import {WidgetBuilder} from '../utils/blocs.js';

enum GESTURE{
    NO_ACTION,
    TAP,
    SWIPE_LEFT,
    SWIPE_RIGHT,
    SWIPE_UP,
    SWIPE_DOWN
}

/**
 * Swipe Horizontal is given preference over Vertical swipe.
 */
class GestureDetectorBloc extends Bloc<GESTURE>{

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
            this.emit(GESTURE.TAP);
        }else{
            this.isDragging=false;
            //need to resolve to other gestures in here
            let h = (this._posEndX- this._posStartX)*this.drag_sensitivity;
            let v = (this._posEndY- this._posStartY)*this.drag_sensitivity;
            
            if(h>=v){
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
                        this.emit(GESTURE.SWIPE_UP)
                    }else{
                        this.emit(GESTURE.NO_ACTION);
                    }
                }else{
                    //left movement
                    if(Math.abs(v)>this.minDistanceInPx){
                        this.emit(GESTURE.SWIPE_DOWN)
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
    constructor(private drag_sensitivity:number = 0.5, private minDistanceInPx:number=150){
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

export class GestureDetector extends WidgetBuilder<GestureDetectorBloc,GESTURE>{
    constructor(){
        super(GestureDetectorBloc,{
            useThisBloc: new GestureDetectorBloc(),
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
        },
        passive: true
    }

    private _onTouchEnd = {
        handleEvent: (e:TouchEvent)=>{
            this.bloc?.onEnd(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
        },
        passive: true
    }

    private _onTouchMove = {
        handleEvent: (e:TouchEvent)=>{
            this.bloc?.onMove(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
        },
        passive: true
    }

    builder(state: GESTURE): TemplateResult {
        switch (state) {
            case GESTURE.NO_ACTION: break;
            case GESTURE.TAP: this.onTap();break;
            case GESTURE.SWIPE_LEFT: this.onSwipeLeft();break;
            case GESTURE.SWIPE_RIGHT: this.onSwipeRight();break;
            case GESTURE.SWIPE_UP: this.onSwipeUp();break;
            case GESTURE.SWIPE_DOWN: this.onSwipeDown();break;
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
}
