import { Bloc, BlocBuilderConfig, BlocsProvider } from "bloc-them";
import { html, TemplateResult } from "lit-html";
import { ifDefined } from "lit-html/directives/if-defined";
import { IncomingRequest, InfoAboutAFile,PickedFileInfoForOutPut } from "../interfaces";
import { BogusBloc, WidgetBuilder } from "../utils/blocs";
import { Utils } from "../utils/utils";
import { HideBloc } from "../widgets/dialogues";
import { AppPageBloc } from "../widgets/route-them/RouteThem";
import { SnackBarBloc } from "../widgets/snackbar-messaging";

interface ImageCompressOutPut{
    id:number;
    file: Blob;
}

interface PickedFileInfo{
    url:string;
    name:string;
    mime:string;
    size:number;
}


export abstract class FilePickerBloc extends Bloc<PickedFileInfo[]>{

    private current_selected_files?: File[];
    private _max_file_picker:number=-1;
    private count:number=0;
    private resolvers: Record<number,any>={};
    private worker: Worker;

    constructor(){
        super([]);
        this.worker = new Worker("/js/use-them/image-utils.js");
        this.worker.onmessage=(e:MessageEvent<ImageCompressOutPut>)=>{
            this.resolvers[e.data.id](e.data.file);
            delete this.resolvers[e.data.id];
        }
    }

    
    public set max_file_picker(v : number) {
        this._max_file_picker = v;
    }
    
    
    public get max_file_picker() : number{
        return this._max_file_picker;
    }
    
    async fileSelected(context:HTMLInputElement){
        this.revokeAllObjectURL();
        const snackBar = BlocsProvider.of<SnackBarBloc>("SnackBarBloc",context);
        if(!snackBar){
            throw `Please make sure to provide SnackBarBloc and snack-bar for this to work properly`
        }
        if(!context.files){
            return snackBar.postMessage({
                msg: "no_file_selected_msg"
            })
        }

        const max_files = this._max_file_picker;
        if(context.files.length>max_files){
            snackBar.postMessage({
                msg: `Max: ${max_files} files only!`
            })
        }

        if(context.files.length ===0){
            this.current_selected_files = [];
            this.emit([]);
        }else{
            const j = Array.from(context.files);
            this.current_selected_files = j;
            this.emit(j.slice(0,max_files).map(f=>{
                return {name: f.name, url: URL.createObjectURL(f),mime:f.type, size:f.size}
            }));
        }
    }

    convertImage(req:IncomingRequest){
        this.count++;
        const id = this.count;
        //@ts-ignore
        req.id=id;

        return new Promise<Blob>(res=>{
            this.resolvers[id]=res;
            this.worker.postMessage(req);
        });
    }

    async createImageHash(file:Blob){
        const b = await this.convertImage({id:"dummy",
            file,max_length: 15,quality:0.5,type:"image/webp"
        });
        return b;
    }

    async createVideoHash(file:Blob){
        const b = await Utils.compressAndResizeImage({
            file,max_length: 15,quality:0.5,type:"image/webp",id:"1"
        });
        return b;
    }

    abstract upOnFileSelection(filePicked:PickedFileInfoForOutPut[]):void;

    async postFileMessage(context: HTMLElement,picker_type:FilePickerType){
        let output_type:string="image/webp";
        
        const snackBarBloc = this.getBloc<SnackBarBloc>("SnackBarBloc");
        if(!snackBarBloc){
            throw `Please make sure to provide SnackBarBloc and snack-bar for this to work properly`
        }
            

        //TODO: here you can save attachment to some cloud storage
        //and instead save media_link in media_attachment

        //TODO: analytics on attachment can be done here to create tags by using AI
        
        let result: PickedFileInfoForOutPut[]=[];

        if(this.current_selected_files){
            let noImageHashRequired:boolean = false;
            //let save the media attachments
            for(let f of this.current_selected_files){
                let compressed_file:Blob;
                let file_hash:Blob;
                switch(picker_type){
                    case FilePickerType.IMAGE:{
                        compressed_file=await this.convertImage({
                            id:"dummy",
                            file:f,
                            max_length: 500,
                            quality:0.80,
                            type: output_type
                        });
                        file_hash=await this.createImageHash(f);
                        break;
                    }
                    case FilePickerType.VIDEO:{
                        compressed_file=f;
                        file_hash=await this.createVideoHash(await Utils.getVideoCover(f));
                        break;
                    }
                    case FilePickerType.AUDIO:{
                        compressed_file=f;
                        noImageHashRequired=true;
                        break;
                    }
                    case FilePickerType.FILE:{
                        compressed_file=f;
                        noImageHashRequired=true;
                        break;
                    }
                    default:
                            throw "Not defined yet";
                }
                const attachment_name:string =f.name;
                let r : PickedFileInfoForOutPut = {
                    fileBlob: compressed_file,
                    file_name: attachment_name,
                }
                if(!noImageHashRequired){
                    const ab = await new Promise<Uint8Array>(res=>{
                        const fr = new FileReader();
                        fr.onloadend=()=>{
                            let t = new Uint8Array(fr.result as ArrayBuffer);
                            res(t);
                        }
                        fr.readAsArrayBuffer(file_hash);
                    });
                    let t = Array.from(ab);
                    r.fileHash=t;
                    r.fileHashBlob=file_hash!;
                }

                result.push(r);
            }
        }
        this.upOnFileSelection(result);
        this.closeFilePicker(context);
    }

    closeFilePicker(context:HTMLElement){
        const appPageBloc = BlocsProvider.of<AppPageBloc>("AppPageBloc",context);
        appPageBloc?.popOutOfCurrentPage();
    }

    revokeAllObjectURL(){
        if(this.state && this.state.length>0){
            for(let fn of this.state){
                URL.revokeObjectURL(fn.url);
            }
        }
    }
}

export class ImageConfirmationToolBoxContainer extends WidgetBuilder<HideBloc,boolean>{
    constructor(){
        super("HideBloc",{
            useThisBloc: new HideBloc()
        });
    }

    builder(state: boolean): TemplateResult {
        return !state?html`<lay-them ma="center" ca="center" overflow="hide"><circular-progress-indicator></circular-progress-indicator></lay-them>`:html`<div><slot></slot></div>`;
    }
}
if(!customElements.get("image-picker-confirmation-box-container")){
    customElements.define("image-picker-confirmation-box-container",ImageConfirmationToolBoxContainer);
}

export class PickedFileWidget extends BlocsProvider{
    public _uInfo!:InfoAboutAFile; 

    builder(): TemplateResult {
        return html`<div style="background-color: #00000026;padding: 10px;padding-bottom: 30px;">
        <lay-them in="column" ca="center">
            <div><ut-icon icon="insert-drive-file"></ut-icon></div>
            <div style="word-break: break-word;font-family: monospace;font-size: 0.8em;padding-top: 5px;text-align: center;">
                <div style="user-select: none;">${this._uInfo.ext}(${Utils.formatBytes(this._uInfo.size)})</div>
                <div>${this._uInfo.name}</div>
            </div>
        </lay-them>
    </div>`;
    }
    
    public set info_abt_file(v :  InfoAboutAFile) {
        this._uInfo=v;
        this._build();    
    }
    
}

if(!customElements.get("ut-picked-file-widget")){
    customElements.define("ut-picked-file-widget",PickedFileWidget);
}

export enum FilePickerType{
    IMAGE,
    VIDEO,
    AUDIO,
    FILE
}

interface PickerConfig{
    capture?:"user"|"environment";
    type: FilePickerType;
    accept?: string;
}

/**
 * bloc_name: file picker bloc name \
 * bloc_config: Usual Bloc config for the bloc name \
 * max_file: maximum number of files allowed to picked by this file picker.
 * 
 * **picker_config.accept** values:
 * 
 * For images: "image/\*" \
 * For video: "video/mp4,video/x-m4v,video/\*" \
 * For audio: "audio/\*"
 * 
 * If you want to use camera, then **picker_config.capture=true**
 */
export interface FilePickerConfig{
    bloc_name:string,
    max_file:number,
    bloc_config?: BlocBuilderConfig<FilePickerBloc,PickedFileInfo[]>;
    picker_config?:PickerConfig;
}

/**
 * Usage example:
 * 
 * ```html
 * 
<app-page route="/#/file-picker" behaves="reload">
    <file-picker title="Upload File"></file-picker>
</app-page>
 * ```
 */
export abstract class FilePickerScreen extends WidgetBuilder<FilePickerBloc,PickedFileInfo[]>{
    public picker_config: PickerConfig;

    fileChanged=(e:InputEvent)=>{
        //@ts-ignore
        const t: HTMLInputElement = e.target;
        this.bloc?.fileSelected(t);
    }

    constructor(protected config:FilePickerConfig){
        super(config.bloc_name,config.bloc_config);
        this.picker_config ={
            accept:"*/*",
            capture:"environment",
            type: FilePickerType.FILE
        };
        if(config.picker_config){
            this.picker_config={...this.picker_config,...config.picker_config};
        }
    }

    connectedCallback(){
        super.connectedCallback();
        if(this.bloc){
            this.bloc.max_file_picker=this.config.max_file;
        }
    }

    disconnectedCallback(){
        this.bloc?.revokeAllObjectURL();
        super.disconnectedCallback(); 
    }

    builder(state: PickedFileInfo[]): TemplateResult {
        let title="attach";
        if(this.title && this.title.trim().length>0){
            title=this.title;
        }
        return html`
        <style>
            .options{
                padding: 20px;
            }
            input[type="file"] {
                display: none;
            }
            .image_grid{
                display: grid;
                gap: 20px;
                align-items: center;
                justify-items: center;
                grid-template-columns: auto auto;
            }
            .image_item{
                width: 30vw;
                height: 30vw;
                text-align: center;
            }
            .video_item{
                width: 90vw;
            }
        </style>
        <backable-screen title=${title}>
            <lay-them in="column" ca="stretch" ma="flex-start">
                <div style="flex:1; max-height: calc(100vh - 150px);overflow-y: auto;padding: 10px;">
                    ${state.length===0?html`<lay-them ma="center" ca="center"><ut-p>no_file_selected</ut-p></lay-them>`:html`
                        <div class="image_grid">
                            ${state.map(pickedFileInfo=>{
                                return html`<lay-them in="column" ma="center">
                                    <div>${(()=>{
                                        switch(this.title){
                                            case "Upload Video": return html`<video controls class="video_item" src=${pickedFileInfo.url}></video>`;
                                            case "Upload Audio": return html`<audio controls class="video_item" src=${pickedFileInfo.url}></audio>`;
                                            case "Upload File": return html`<ut-picked-file-widget .info_abt_file=${(()=>{
                                                return {size: pickedFileInfo.size, ext:pickedFileInfo.mime,name:pickedFileInfo.name};
                                            })()}></ut-picked-file-widget>`;
                                            default: return html`<img class="image_item" src=${pickedFileInfo.url}>`;
                                        }
                                    })()}</div>
                                    <div style="font-family:monospace;word-break: break-word;width: 30vw;"><ut-h5>${pickedFileInfo.name}</ut-h5></div>
                                </lay-them>`;
                            })}
                        </div>
                    `}
                </div>
                <div class="options">
                    <image-picker-confirmation-box-container>
                        <lay-them in="row" ma="space-around">
                            <div>
                                <label for="file-upload">
                                    <circular-icon-button use="icon:attach-file"></circular-icon-button>
                                </label>
                                <input id="file-upload" type="file" @change=${this.fileChanged} multiple accept=${this.picker_config.accept??"*/*"}  capture=${ifDefined(this.picker_config.capture)}>
                            </div>
                            <div>
                                <circular-icon-button use="icon:done;" @click=${(e:Event)=>{  
                                    this.bloc?.postFileMessage(e.target as HTMLElement,this.picker_config.type);
                                }}></circular-icon-button>
                            </div>
                            <div>
                                <circular-icon-button use="icon:clear;" @click=${(e:Event)=>{
                                    this.bloc?.closeFilePicker(e.target as HTMLElement);
                                }}></circular-icon-button>
                            </div>
                        </lay-them>
                    </image-picker-confirmation-box-container>
                </div>
            </lay-them>
        </backable-screen>`;
    }
}