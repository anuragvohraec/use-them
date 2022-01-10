import { html, TemplateResult } from "lit-html";
import { IEMessage, IEMessageType, IEValue } from "../interfaces";
import { WidgetBuilder } from "../utils/blocs";
import { FormInputMaker } from "../utils/makers/form-input-maker";
import { HideBloc } from "./dialogues";
import { FormBloc, FormMessageBloc, PostValidationOnChangeFunction, ValidatorFunction } from "./forms";
import { Range } from "./inputs/rangeselector";

export class ImageEditorHideBloc extends HideBloc{
    private _blob!: Blob;
    private _fileName!:string;
    private blobIndex:number=0;

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

    private imageEditorWorker= new Worker("/js/use-them/image-editor.js");

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
        this.draw(this.getInitValue(),IEMessageType.NEW_IMAGE);
    }

    public editImage({index,blob,fileName}:{index:number,blob:Blob,fileName:string}){
        this.blobIndex=index;
        this._fileName=fileName;
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
                    padding: 20px;
                }
                .output{
                    width: 300px;
                    height: 300px;
                }
                .opCont{
                    display: flex;
                    justify-content: center;
                    padding: 12px;
                }
            </style>
            <div class="cont">
                <lay-them in="column" ma="flex-start" ca="stretch">
                    <div class="title">${this.bloc?.fileName}</div>
                    <div class="opCont">
                        <canvas class="output" width="300px" height="300px" id="output"></canvas>
                    </div>
                    <div>
                        ${state?html``: html`<ut-ie-inputs style="--label-color:white;"></ut-ie-inputs>`}
                    </div>
                </lay-them>
            </div>`;
    }
}
customElements.define("ut-image-editor",ImageEditor);

class ImageEditorFormBloc extends FormBloc{
    private editorBloc!:ImageEditorHideBloc;

    constructor(){
        super({
            brightness:{start:0,end:50},
            contrast:{start:0,end:50}
        });
    }
    validatorFunctionGiver(nameOfInput: string): ValidatorFunction<any> | undefined {
        return;
    }
    postOnChangeFunctionGiver(nameOfInput: string): PostValidationOnChangeFunction<any> | undefined {
        if(!this.editorBloc){
            this.editorBloc!=ImageEditorHideBloc.search<ImageEditorHideBloc>("ImageEditorHideBloc",this.hostElement);
        }

        if(nameOfInput === "brightness"){
            return (cv:Range)=>{
                this.editorBloc.setBrightness(cv.end);
            }
        }else if(nameOfInput==="contrast"){
            return (cv:Range)=>{
                this.editorBloc.setContrast(cv.end);
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
                        range:{
                            end:100,
                            start:0
                        }
                    },
                    label:"Brightness"
                },
                contrast:{
                    type:"RangeSelector",
                    config:{
                        bloc_name:"ImageEditorFormBloc",
                        name:"contrast",
                        range:{
                            end:100,
                            start:0
                        }
                    },
                    label:"Contrast"
                }
            }
        })
    }
}
customElements.define("ut-ie-inputs",ImageEditorInputs);