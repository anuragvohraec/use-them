import { Bloc, BlocBuilderConfig, BlocsProvider } from "bloc-them";
import { html, nothing, TemplateResult } from "lit-html";
import { ifDefined } from "lit-html/directives/if-defined";
import { repeat } from "lit-html/directives/repeat";
import { IEMessage, IEMessageType, IEValue, IncomingRequest, InfoAboutAFile,PickedFileInfoForOutPut } from "../interfaces";
import { BogusBloc, NoBlocWidgetBuilder, UtRegistryBloc, WidgetBuilder } from "../utils/blocs";
import { Utils } from "../utils/utils";
import { HideBloc } from "../widgets/dialogues";
import { ImageEditorHideBloc } from "../widgets/image-editor-widget";
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
    private static count:number=0;
    private static resolvers: Record<number,any>={};
    private static worker: Worker=FilePickerBloc.initializeWorker();

    private static initializeWorker(){
        let worker = new Worker("/js/use-them/image-utils.js");
        worker.onmessage=(e:MessageEvent<ImageCompressOutPut>)=>{
            this.resolvers[e.data.id](e.data.file);
            delete this.resolvers[e.data.id];
        }
        return worker;
    }

    constructor(){
        super([]);
    }

    
    public set max_file_picker(v : number) {
        this._max_file_picker = v;
    }
    
    
    public get max_file_picker() : number{
        return this._max_file_picker;
    }

    removeFile(index:number){
        if(this.state[index]){
            this.state.splice(index,1);
            this.emit([...this.state]);
        }
    }

    public get selectedFiles(): File[]|undefined{
        return this.current_selected_files;
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
            this.emit(this.current_selected_files.slice(0,max_files).map(f=>{
                return {name: f.name, url: URL.createObjectURL(f),mime:f.type, size:f.size}
            }));
        }
    }

    convertImage(req:IncomingRequest){
        FilePickerBloc.count++;
        const id = FilePickerBloc.count;
        //@ts-ignore
        req.id=id;

        return new Promise<Blob>(res=>{
            FilePickerBloc.resolvers[id]=res;
            FilePickerBloc.worker.postMessage(req);
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

    abstract upOnFileSelection(filePicked:PickedFileInfoForOutPut[], simulation_ctx?:any):any;

    /**
     * This function could be used for simulating faster processing.
     * Say a chat window can creat some cache items to show item is under upload.
     * And is generally supported by some cache to store some temporary data.
     * @returns simulation_ctx which can be used by clean up later 
     */
    protected async simulateFasterProcessing(context: HTMLElement):Promise<any>{
        return "dummy";
    }

    /**
     * Is used in conjunction with simulate faster processing, to clean up any resource after all things are processed
     * @param simulation_ctx 
     * @returns 
     */
    protected async cleanUpAfterProcessing(simulation_ctx:any):Promise<void>{
        return ;
    }

    async postFileMessage(context: HTMLElement,picker_type:FilePickerType,doNotCloseFilePicker:boolean=false){
            const simulation_ctx = await this.simulateFasterProcessing(context);

            (async(files:File[])=>{
               let result = await this._processFilePicked(picker_type,files!);
               await this.upOnFileSelection(result,simulation_ctx);
               await this.cleanUpAfterProcessing(simulation_ctx);
            })(this.selectedFiles!);

            this.current_selected_files=undefined;
            this.emit([]);
            
            if(!doNotCloseFilePicker){
                this.closeFilePicker(context);
            }
    }

    async postFileMessageAndReturnValue(context: HTMLInputElement,picker_type:FilePickerType,doNotCloseFilePicker:boolean=false){
        if(context.files){
            let result: PickedFileInfoForOutPut[] = await this._processFilePicked(picker_type,Array.from(context.files));
            let t = await this.upOnFileSelection(result);
            if(!doNotCloseFilePicker){
                this.closeFilePicker(context);
            }
            return t;
        }
    }

    private async _processFilePicked(picker_type: FilePickerType, files:File[]) {
        let output_type: string = "image/webp";

        const snackBarBloc = this.getBloc<SnackBarBloc>("SnackBarBloc");
        if (!snackBarBloc) {
            throw `Please make sure to provide SnackBarBloc and snack-bar for this to work properly`;
        }


        //TODO: here you can save attachment to some cloud storage
        //and instead save media_link in media_attachment
        //TODO: analytics on attachment can be done here to create tags by using AI
        let result: PickedFileInfoForOutPut[] = [];

        if (files) {
            let noImageHashRequired: boolean = false;
            //let save the media attachments
            for (let f of files) {
                let compressed_file: File;
                let file_hash: Blob;
                switch (picker_type) {
                    case FilePickerType.IMAGE: {
                        if(f.type==="image/gif"){
                            compressed_file=f;
                        }else{
                            let fName=f.name;
                            let b = await this.convertImage({
                                id: "dummy",
                                file: f,
                                max_length: 500,
                                quality: 0.80,
                                type: output_type
                            });
                            compressed_file=new File([b],fName,{
                                type:"image/webp"
                            });
                        }
                        
                        file_hash = await this.createImageHash(f);
                        break;
                    }
                    case FilePickerType.VIDEO: {
                        compressed_file = f;
                        file_hash = await this.createVideoHash(await Utils.getVideoCover(f));
                        break;
                    }
                    case FilePickerType.AUDIO: {
                        compressed_file = f;
                        noImageHashRequired = true;
                        break;
                    }
                    case FilePickerType.FILE: {
                        compressed_file = f;
                        noImageHashRequired = true;
                        break;
                    }
                    default:
                        throw "Not defined yet";
                }
                const attachment_name: string = f.name;
                let r: PickedFileInfoForOutPut = {
                    fileBlob: compressed_file,
                    file_name: attachment_name,
                };
                if (!noImageHashRequired) {
                    const ab = await new Promise<Uint8Array>(res => {
                        const fr = new FileReader();
                        fr.onloadend = () => {
                            let t = new Uint8Array(fr.result as ArrayBuffer);
                            res(t);
                        };
                        fr.readAsArrayBuffer(file_hash);
                    });
                    let t = Array.from(ab);
                    r.fileHash = t;
                    r.fileHashBlob = file_hash!;
                }

                result.push(r);
            }
        }
        return result;
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
    imageEditorOutPutSize?:string;
}

/**
 * Is used to open file picker from other places in code.
 */
export class FilePickerExternalTriggers extends Bloc<number>{
    protected _name: string="FilePickerExternalTriggers";
    protected filePickerRegistry:Record<string,FilePickerScreen>={};

    constructor(){
        super(0);
    }
    
    register(filePickerScreen:FilePickerScreen){
        this.filePickerRegistry[filePickerScreen.tagName.toLowerCase()]=filePickerScreen;
    }

    /**
     * Manually call app page bloc to open the page too
     * @param tagName 
     */
    openFilePicker(tagName:string, routeName:string,data?:any){
        AppPageBloc.search<AppPageBloc>("AppPageBloc",this.hostElement)?.goToPage(routeName,data);
        setTimeout(()=>{
            this.filePickerRegistry[tagName.toLowerCase()]?.openFilePickerExternally();
        },300);
    }
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
        setTimeout(()=>{
            FilePickerExternalTriggers.search<FilePickerExternalTriggers>("FilePickerExternalTriggers",this)?.register(this);   
        },200);
    }

    disconnectedCallback(){
        this.bloc?.revokeAllObjectURL();
        super.disconnectedCallback(); 
    }

    /**
     * Used specifically by external triggers. To open file picker
     */
    openFilePickerExternally=()=>{
        let t = this.shadowRoot?.querySelector("backable-screen > lay-them > div.options > image-picker-confirmation-box-container > lay-them > div:nth-child(1) > label") as HTMLInputElement;
        t.click();
    }

    removeIndex=(e:Event)=>{
        const t= e.currentTarget as HTMLElement;
        const index:number = parseInt(t.getAttribute("i")??"0");
        this.bloc?.removeFile(index);
    }

    editIndex=(e:Event)=>{
        const t= e.currentTarget as HTMLElement;
        const index:number = parseInt(t.getAttribute("i")??"0");
        const ctx = this.shadowRoot?.querySelector("ut-image-editor") as HTMLElement;
        if(true||ctx){
            const ihb = UtRegistryBloc.get<ImageEditorHideBloc>("ImageEditorHideBloc");//ImageEditorHideBloc.search<ImageEditorHideBloc>("ImageEditorHideBloc",ctx);
            if(ihb && this.bloc?.selectedFiles?.[index]){
                const fileName = this.bloc.selectedFiles[index].name;
                ihb.editImage({
                    index,
                    fileName,
                    blob:this.bloc.selectedFiles[index],
                    imageEditedListener:(blob:Blob,i:number)=>{
                        if(this.bloc?.selectedFiles){
                            this.bloc.selectedFiles[index]=new File([blob],fileName,{
                                type:"image/webp"
                            });
                            this.bloc.emit(this.bloc.selectedFiles.slice(0,this.config.max_file).map(f=>{
                                return {name: f.name, url: URL.createObjectURL(f),mime:f.type, size:f.size}
                            }));
                        }
                    }
                });
                ihb.toggle();
            }
        }
    }

    builder(state: PickedFileInfo[]): TemplateResult {
        let title="attach";
        if(this.title && this.title.trim().length>0){
            title=this.title;
        }
        return html`
        <style>
            .options{
                padding: 10px;
            }
            input[type="file"] {
                display: none;
            }
            .image_grid{
                display: flex;
                gap: 20px;
                align-items: center;
                justify-items: center;
                grid-template-columns: auto auto;
                justify-content: center;
                flex-wrap: wrap;
            }
            .image_item{
                width: 300px;
                height: 300px;
                text-align: center;
            }
            .video_item{
                width: 90vw;
            }
            .edit-button{
                width:50px;
                height:50px;
            }
        </style>
        <backable-screen title=${title}>
            <lay-them in="column" ca="stretch" ma="space-between">
                <div style="flex-grow: 1;height:0px;overflow-y: auto;padding: 10px;">
                    ${state.length===0?html`<lay-them ma="center" ca="center"><ut-p>no_file_selected</ut-p></lay-them>`:html`
                        <div class="image_grid">
                            ${repeat(state,(item)=>item.name,(pickedFileInfo,index)=>{

                                return html`<lay-them in="column" ma="center">
                                <div>${(()=>{
                                    switch(this.title){
                                        case "Upload Video": return html`<video controls class="video_item" src=${pickedFileInfo.url}></video>`;
                                        case "Upload Audio": return html`<audio controls class="video_item" src=${pickedFileInfo.url}></audio>`;
                                        case "Upload File": return html`<ut-picked-file-widget .info_abt_file=${(()=>{
                                            return {size: pickedFileInfo.size, ext:pickedFileInfo.mime,name:pickedFileInfo.name};
                                        })()}></ut-picked-file-widget>`;
                                        default: return html`<lay-them in="stack">
                                            <img class="image_item" src=${pickedFileInfo.url}>
                                            <div style="bottom:0px;width:100%;height:50px;background-color: #00000094;">
                                                <lay-them in="row" ma="space-between" ma="center">
                                                    <div class="edit-button"  @click=${this.editIndex} i=${index}>
                                                        <ink-well>
                                                            <ut-icon icon="edit" use="icon_inactive:white;"></ut-icon>
                                                        </ink-well>
                                                    </div>
                                                    <div class="edit-button" @click=${this.removeIndex} i=${index}>
                                                        <ink-well>
                                                            <ut-icon icon="clear" use="icon_inactive:white;"></ut-icon>
                                                        </ink-well>
                                                    </div>
                                                </lay-them>
                                            </div>
                                        </lay-them>`;
                                    }
                                })()}</div>
                                <div style="font-family:monospace;word-break: break-word;min-width: 30vw;"><ut-h5>${pickedFileInfo.name}</ut-h5></div>
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
                                    this.bloc?.postFileMessage(e.currentTarget as HTMLElement,this.picker_config.type);
                                }}></circular-icon-button>
                            </div>
                            <div>
                                <circular-icon-button use="icon:clear;" @click=${(e:Event)=>{
                                    this.bloc?.closeFilePicker(e.currentTarget as HTMLElement);
                                }}></circular-icon-button>
                            </div>
                        </lay-them>
                    </image-picker-confirmation-box-container>
                </div>
            </lay-them>
        </backable-screen>`;
    }
}


class FilePickerFunctionalityProvider extends NoBlocWidgetBuilder{
    builder(state: number): TemplateResult {
        return html`<div style="width:100%;height:100%">
        <slot></slot>
        </div>
        <ut-image-editor iesize=${this.getAttribute("iesize")??"500px"}></ut-image-editor>`;
    }
}
customElements.define("ut-file-picker-editor",FilePickerFunctionalityProvider);