
import { Bloc, findBloc, html, TemplateResult } from 'bloc-them';
import { UseThemConfiguration } from "../configs";
import { IEDrawPurpose, IEMessage, IEMessageType, IEValue, XY } from "../interfaces";
import { UtRegistryBloc, WidgetBuilder } from "../utils/blocs";
import { FormInputMaker } from "../utils/makers/form-input-maker";
import { HideBloc } from "./dialogues";
import { FormBloc, FormMessageBloc, PostValidationOnChangeFunction, ValidatorFunction } from "./forms";
import { ZoomAndPanBloc } from "./gesturedetector";
import { Range } from "./inputs/rangeselector";

interface ImageEditedListener{
    (blob:Blob,index:number):void
}

export class ImageEditorHideBloc extends HideBloc{
    private _blob!: Blob;
    private _fileName!:string;
    private blobIndex:number=0;
    protected _name: string="ImageEditorHideBloc";

    private imageEditedListener!:ImageEditedListener;

    private currentValue!:IEValue;

    public get fileName(){
        return this._fileName;
    }

    private _canvas?: HTMLCanvasElement;

    onConnection(ctx:HTMLElement, blocName:string){
        super.onConnection(ctx,blocName);
        setTimeout(() => {
            let offCan = (this.canvas as any).transferControlToOffscreen();
            let msg:IEMessage={
                type:IEMessageType.INIT,
                value:offCan
            };
            this.imageEditorWorker.postMessage(msg,[offCan]);
        }, 100);
    }

    onDisconnection(){
        this.imageEditorWorker.terminate();
    }

    private getInitValue():IEValue{
        let t=UseThemConfiguration.IMAGE_EDIT_OP_DEFAULT_SIZE;
        let p = this.hostElement!.getAttribute("iesize");
        if(p){
            t= parseInt(p)??UseThemConfiguration.IMAGE_EDIT_OP_DEFAULT_SIZE;
        }
        const max_dimension=t;
        return {
            brightness:0,
            contrast:0,
            movement:{x:0,y:0},
            axis:{x:0,y:0},
            zoom:1,
            newImageConfig:{
                baseDimension:{x:max_dimension,y:max_dimension},
                opMaxLength:max_dimension,
                origBlob:this.blob
            },
            draw_purpose:IEDrawPurpose.NEW_IMAGE
        };
    }

    private imageEditorWorker= (()=>{
        let w = new Worker("/js/use-them/image-editor.js");
        w.onmessage=(e:MessageEvent<{blob:Blob}>)=>{
            this.imageEditedListener(e.data.blob,this.blobIndex);
        }
        return w;
    })();;

    private get canvas(): HTMLCanvasElement {
        if(!this._canvas){
            this._canvas=this.hostElement!.shadowRoot?.querySelector("#output") as HTMLCanvasElement;
        }
        return this._canvas;
    }

    private get blob(): Blob {
        return this._blob;
    }

    private set blob(value: Blob) {
        this._blob = value;
        this.initDraw();
    }

    public initDraw(){
        findBloc<ImageEditorFormBloc>("ImageEditorFormBloc",this.hostElement!)?.resetForm();
        let initValue = this.getInitValue();
        this.draw(initValue,IEMessageType.NEW_IMAGE);
        delete initValue.newImageConfig;
    }

    public editImage({index,blob,fileName,imageEditedListener}:{index:number,blob:Blob,fileName:string, imageEditedListener:ImageEditedListener}){
        this.blobIndex=index;
        this._fileName=fileName;
        this.imageEditedListener=imageEditedListener;
        this.blob=blob;
    }
    
    private draw(value:IEValue, type:IEMessageType=IEMessageType.DRAW){
        this.currentValue=value;
        let msg:IEMessage={type,value};
        this.imageEditorWorker.postMessage(msg);
    }

    public setBrightness(newValue:number){
        this.draw({...this.currentValue,brightness:newValue, draw_purpose:IEDrawPurpose.BRIGHTNESS,movement:{x:0,y:0},zoom:1});
    }

    public setContrast(newValue:number){
        this.draw({...this.currentValue,contrast:newValue, draw_purpose:IEDrawPurpose.CONTRAST,movement:{x:0,y:0},zoom:1});
    }
    
    public acceptImage(){
        this.imageEditorWorker.postMessage({type:IEMessageType.GIVE_IMAGE});
    }

    public onPan(movement:XY,axis:XY){
        this.currentValue.movement=movement;
        this.currentValue.axis=axis;
        this.currentValue.zoom=1;

        this.currentValue.draw_purpose=IEDrawPurpose.PAN;
        this.draw(this.currentValue);
    }

    public onZoom(zoom:number,axis:XY){
        let effectiveZoom:number=zoom;
        if(zoom>1+UseThemConfiguration.IMAGE_EDIT_ZOOM_SENSITIVITY){
            effectiveZoom=1+UseThemConfiguration.IMAGE_EDIT_ZOOM_SENSITIVITY;
        }else if(zoom<1-UseThemConfiguration.IMAGE_EDIT_ZOOM_SENSITIVITY){
            effectiveZoom=1-UseThemConfiguration.IMAGE_EDIT_ZOOM_SENSITIVITY;
        }

        this.currentValue.movement={x:0,y:0};
        this.currentValue.zoom=effectiveZoom;
        this.currentValue.axis=axis;

        this.currentValue.draw_purpose=IEDrawPurpose.ZOOM;
        this.draw(this.currentValue);
    }
}

class ImageEditor extends WidgetBuilder<boolean>{
    constructor(){
        super("ImageEditorHideBloc",{
            ImageEditorHideBloc: new ImageEditorHideBloc(true,"ImageEditorHideBloc"),
            ImageEditorFormBloc: new ImageEditorFormBloc(),
            FormMessageBloc: new FormMessageBloc()
        });
    }

    connectedCallback(){
        super.connectedCallback();
        setTimeout(() => {
            UtRegistryBloc.add("ImageEditorHideBloc",this.getHostedBloc("ImageEditorHideBloc"));
        }, 100);
    }

    hideEditor=(e:Event)=>{
        this.bloc<ImageEditorHideBloc>()?.toggle();
    }

    acceptImage=(e:Event)=>{
        this.bloc<ImageEditorHideBloc>()?.acceptImage();
        this.bloc<ImageEditorHideBloc>()?.toggle();
    }

    private get zapBlocBuilderConfig():Record<string, Bloc<any>>{
        let imageEditorBloc=this.bloc<ImageEditorHideBloc>();
        return {
            ZoomAndPanBloc: new class extends ZoomAndPanBloc{
                onDoublePointTouch(xy: XY): void {
                    
                }
                onPointRelease(xy: XY): void {
                     //do nothing
                }
                onPointTouch(xy: XY): void {
                    //do nothing
                }
                onZoom=(zoom: number,axis:XY): void=> {
                    imageEditorBloc?.onZoom(zoom,axis);
                }
                onPan=(movement: XY,axis:XY): void =>{
                    imageEditorBloc?.onPan(movement,axis);
                }

                protected _name: string="ZoomAndPanBloc";
                constructor(){
                    super(0);
                }
            }
        }
    }
    
    private get iesize():string{
        let t = this.getAttribute("iesize");
        if(!t){
            t="800px";
        }
        return t;
    }

    build(state: boolean): TemplateResult {
        return html`
            <style>
                .cont{
                    display:${state?"none":"block"};
                    position:fixed;
                    top:0px;
                    width:100%;
                    height:100%;
                    background-color: #000000c7;
                    z-index: 3;
                    backdrop-filter: blur(2px);
                }
                .title{
                    color: white;
                    padding: 5px 20px;
                    text-align: center;
                    user-select:none;
                }
                .output{
                    width: 300px;
                    height: 300px;
                    border: 1px solid #ffffff54;
                }
                .opCont{
                    display: flex;
                    justify-content: center;
                    padding: 0px 12px;
                }
                .padH20{
                    padding: 0px 20px;
                }
                .pad20{
                    padding: 20px;
                }
            </style>
            <div class="cont">
                <lay-them in="column" ma="space-between" ca="stretch">
                    <div class="opCont">
                        <ut-pan-zoom-detector bloc="ZoomAndPanBloc" .hostedblocs=${this.zapBlocBuilderConfig as any}>
                            <canvas class="output" width=${this.iesize} height=${this.iesize} id="output"></canvas>
                        </ut-pan-zoom-detector>
                    </div>
                    <div class="padH20">
                        ${state?html``: html`<ut-ie-inputs style="--label-color:white;"></ut-ie-inputs>`}
                    </div>
                    <div class="pad20">
                        <lay-them in="row" ma="space-between">
                            <circular-icon-button use="icon:done;primaryColor:white;" style="--bg-color:black;" @click=${this.acceptImage}></circular-icon-button>
                            <circular-icon-button use="icon:clear;primaryColor:white;" style="--bg-color:black;" @click=${this.hideEditor}></circular-icon-button>
                        </lay-them>
                    </div>
                </lay-them>
            </div>`;
    }
}
customElements.define("ut-image-editor",ImageEditor);

class ImageEditorFormBloc extends FormBloc{
    private _editorBloc?:ImageEditorHideBloc;

    private get editorBloc():ImageEditorHideBloc{
        if(!this._editorBloc){
            let t = findBloc<ImageEditorHideBloc>("ImageEditorHideBloc",this.hostElement!);
            this._editorBloc=t;
        }
        return this._editorBloc!;
    }

    constructor(){
        super({
            brightness:{start:0,end:UseThemConfiguration.IMAGE_EDIT_MID_RANGE},
            contrast:{start:0,end:UseThemConfiguration.IMAGE_EDIT_MID_RANGE}
        });
    }

    resetForm(){
       this.emit({
            brightness:{start:0,end:UseThemConfiguration.IMAGE_EDIT_MID_RANGE},
            contrast:{start:0,end:UseThemConfiguration.IMAGE_EDIT_MID_RANGE}
        });
    }

    validatorFunctionGiver(nameOfInput: string): ValidatorFunction<any> | undefined {
        return;
    }
    
    postOnChangeFunctionGiver(nameOfInput: string): PostValidationOnChangeFunction<any> | undefined {
        if(nameOfInput === "brightness"){
            return (cv:Range)=>{
                this.editorBloc.setBrightness(cv.end-UseThemConfiguration.IMAGE_EDIT_MID_RANGE);
            }
        }else if(nameOfInput==="contrast"){
            return (cv:Range)=>{
                this.editorBloc.setContrast(cv.end-UseThemConfiguration.IMAGE_EDIT_MID_RANGE);
            }
        }
    }
    protected _name: string="ImageEditorFormBloc"

}

class ImageEditorInputs extends FormInputMaker{
    constructor(){
        super({
            formBloc_name:"ImageEditorFormBloc",
            tag_prefix:"ut-ie",
            inputs:{
                brightness:{
                    type:"RangeSelector",
                    config:{
                        bloc_name:"ImageEditorFormBloc",
                        name:"brightness",
                        rangeSelectorConfig:{
                            range:{
                                end:2*UseThemConfiguration.IMAGE_EDIT_MID_RANGE,
                                start:0
                            },
                            isint:true,
                            no_label:true,
                            no_start:true
                        }
                    },
                    label:"Brightness"
                },
                contrast:{
                    type:"RangeSelector",
                    config:{
                        bloc_name:"ImageEditorFormBloc",
                        name:"contrast",
                        rangeSelectorConfig:{
                            range:{
                                end:2*UseThemConfiguration.IMAGE_EDIT_MID_RANGE,
                                start:0
                            },
                            isint:true,
                            no_label:true,
                            no_start:true
                        }
                    },
                    label:"Contrast"
                }
            }
        })
    }
}
customElements.define("ut-ie-inputs",ImageEditorInputs);