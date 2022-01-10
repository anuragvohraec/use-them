import { BlocBuilderConfig } from "bloc-them";
import { html, TemplateResult } from "lit-html";
import { UseThemConfiguration } from "../configs";
import { IEMessage, IEMessageType, IEValue, XY } from "../interfaces";
import { WidgetBuilder } from "../utils/blocs";
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

    onConnection(ctx:HTMLElement){
        super.onConnection(ctx);
        let offCan = this.canvas.transferControlToOffscreen();
        let msg:IEMessage={
            type:IEMessageType.INIT,
            value:offCan
        };
        this.imageEditorWorker.postMessage(msg,[offCan]);
    }

    onDisconnection(){
        this.imageEditorWorker.terminate();
    }

    private getInitValue():IEValue{
        const max_dimension=300;

        return {
            brightness:0,
            contrast:0,
            pan:{x:0,y:0},
            zoom:1,
            newImageConfig:{
                baseDimension:{x:max_dimension,y:max_dimension},
                opMaxLength:max_dimension,
                origBlob:this.blob
            }
        };
    }

    private imageEditorWorker= (()=>{
        let w = new Worker("/js/use-them/image-editor.js");
        w.onmessage=(e:MessageEvent<{blob:Blob}>)=>{
            this.imageEditedListener(e.data.blob,4);
        }
        return w;
    })();;

    private get canvas(): HTMLCanvasElement {
        if(!this._canvas){
            this._canvas=this.hostElement.shadowRoot?.querySelector("#output") as HTMLCanvasElement;
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
        ImageEditorFormBloc.search<ImageEditorFormBloc>("ImageEditorFormBloc",this.hostElement)?.resetForm();
        this.draw(this.getInitValue(),IEMessageType.NEW_IMAGE);
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
        this.draw({...this.currentValue,brightness:newValue});
    }

    public setContrast(newValue:number){
        this.draw({...this.currentValue,contrast:newValue});
    }
    
    public acceptImage(){
        this.imageEditorWorker.postMessage({type:IEMessageType.GIVE_IMAGE});
    }

    public onPan(newValue:XY){
        this.currentValue.pan.x+=newValue.x;
        this.currentValue.pan.y+=newValue.y;
        this.draw(this.currentValue);
    }

    public onZoom(zoom:number){
        //TODO implement this
        this.currentValue.zoom=zoom;
        this.draw(this.currentValue);
    }
}

class ImageEditor extends WidgetBuilder<ImageEditorHideBloc,boolean>{
    constructor(){
        super("ImageEditorHideBloc",{
            blocs_map:{
                ImageEditorHideBloc: new ImageEditorHideBloc(true,"ImageEditorHideBloc"),
                ImageEditorFormBloc: new ImageEditorFormBloc(),
                FormMessageBloc: new FormMessageBloc()
            }
        });
    }

    hideEditor=(e:Event)=>{
        this.bloc?.toggle();
    }

    acceptImage=(e:Event)=>{
        this.bloc?.acceptImage();
        this.bloc?.toggle();
    }

    private get zapBlocBuilderConfig():BlocBuilderConfig<ZoomAndPanBloc,number>{
        let imageEditorBloc=this.bloc;
        return {
            blocs_map:{
                ZoomAndPanBloc: new class extends ZoomAndPanBloc{
                    onZoom=(zoom: number): void=> {
                        imageEditorBloc?.onZoom(zoom);
                    }
                    onPan=(pan: XY): void =>{
                        imageEditorBloc?.onPan(pan);
                    }
    
                    protected _name: string="ZoomAndPanBloc";
                    constructor(){
                        super(0);
                    }
                }
            }
        }
    }

    builder(state: boolean): TemplateResult {
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
                    overflow-x:auto;
                    user-select:none;
                }
                .output{
                    width: 300px;
                    height: 300px;
                }
                .opCont{
                    display: flex;
                    justify-content: center;
                    padding: 0px 12px;
                }
                .padH20{
                    padding: 0px 20px;
                }
            </style>
            <div class="cont">
                <lay-them in="column" ma="flex-start" ca="stretch">
                    <div class="title">${this.bloc?.fileName}</div>
                    <div class="opCont">
                        <ut-pan-zoom-detector bloc="ZoomAndPanBloc" .blocBuilderConfig=${this.zapBlocBuilderConfig as any}>
                            <canvas class="output" width="300px" height="300px" id="output"></canvas>
                        </ut-pan-zoom-detector>
                    </div>
                    <div class="padH20">
                        ${state?html``: html`<ut-ie-inputs style="--label-color:white;"></ut-ie-inputs>`}
                    </div>
                    <div class="padH20">
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
            let t = ImageEditorHideBloc.search<ImageEditorHideBloc>("ImageEditorHideBloc",this.hostElement);
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