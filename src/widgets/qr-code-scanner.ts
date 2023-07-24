import { Bloc, BlocsProvider } from "bloc-them";
import { html, TemplateResult } from 'bloc-them';
import { WidgetBuilder } from "../utils/blocs";
import { HideBloc } from "./dialogues";


export abstract class QrCodeListenerBloc extends Bloc<QrResult[]>{
    abstract user_selected_qr_codes(result? :QrResult[]):any;
}

enum Status{
    INIT,
    CAMERA_LIVE,
    NO_DEVICE_MEDIA,
    SCANNER_NOT_SUPPORTED
}

interface QrScannerState{
    status: Status;
    codes?:QrResult[]
}

export interface QrResult{
    boundingBox: DOMRectReadOnly;
    cornerPoints:{x:number,y:number}[],
    format: string,
    rawValue: string
}

class QrCodeScannerBloc extends Bloc<QrScannerState>{
    protected _name: string="QrCodeScannerBloc";
    private video_el?:HTMLVideoElement;
    private torch_on:boolean=false;
    private videoStream?:MediaStream;

    constructor(){
        super({status: Status.INIT})
    }

    async init(){
        //1. initialize live stream
        try{
            this.emit({status: Status.CAMERA_LIVE});
            this.videoStream = await navigator.mediaDevices.getUserMedia({video:{
                width: 1280, height: 720,
                facingMode: {
                    exact: 'environment',
                }
            },audio:false});
            
            this.video_el= this.hostElement?.shadowRoot?.querySelector("#video_el") as HTMLVideoElement;
            this.video_el.srcObject = this.videoStream;
            this.video_el.onloadeddata=e=>{
                this.video_el?.play();
            };
            
            //2. initialize scanning code in here
        }catch(e){
            //TODO display Please provide camera permission if asked for
            this.emit({status: Status.NO_DEVICE_MEDIA})
        }
    }

    close_camera(){
        if(this.video_el){
            const stream = this.video_el.srcObject;
            //@ts-ignore
            const tracks:any[] = stream.getTracks();

            tracks.forEach((track)=>{
                track.stop();
            });

            this.video_el.srcObject = null;
        }
    }

    scan=async()=>{
        if (!('BarcodeDetector' in window)) {
            this.emit({status:Status.SCANNER_NOT_SUPPORTED});
        } else {
            let qrConfig = (this.hostElement as QrCodeCameraStream).qrConfig;

            // create new detector
            //@ts-ignore
            let barcodeDetector: any = new BarcodeDetector({formats: qrConfig?.formats??["qr_code","ean_13"]});
            if(this.video_el){
                let barCodes = await barcodeDetector.detect(this.video_el);
                (barCodes as Array<any>).forEach(e=>{
                    if(!this.state.codes){
                        this.state.codes=[]
                    }
                    this.state.codes.push(e);
                    this.emit({...this.state,codes:[...this.state.codes]});
                    if(qrConfig?.scan_limit && this.state.codes.length>=qrConfig.scan_limit){
                        this.postQrCode();
                    }
                });

                if(barCodes.length>0){
                    if(qrConfig?.sound_url){
                        let a = new Audio(qrConfig.sound_url);
                        await a.play();
                    }
                }

            }
        }
    }

    postQrCode=()=>{
        let b = BlocsProvider.search<QrCodeListenerBloc>((this.hostElement as QrCodeCameraStream)?.qrConfig?.notify_bloc_name??"QrCodeListenerBloc",this.hostElement);
        if(b){
            b.user_selected_qr_codes(this.state.codes);
        }
        this.close();
    }

    close=()=>{
        BlocsProvider.search<HideBloc>("QrCodeHideBloc",this.hostElement)?.toggle();
    }

    toggle_torch=()=>{
        this.torch_on=!this.torch_on;
        this.videoStream?.getTracks()[0].applyConstraints({
            //@ts-ignore
            advanced: [{torch: this.torch_on}]
        });
    }
}

class QrCodeCameraStream extends WidgetBuilder<QrCodeScannerBloc,QrScannerState>{
    public qrConfig?:QrCodeScannerConfig;

    constructor(){
        super("QrCodeScannerBloc",{
            blocs_map:{
                QrCodeScannerBloc: new QrCodeScannerBloc()
            }
        })
    }

    connectedCallback(){
        super.connectedCallback();
        setTimeout(()=>{
            this.bloc?.init();
        },200);
    }

    disconnectedCallback(){
        this.bloc?.close_camera();
        super.disconnectedCallback();
    }

    builder(state: QrScannerState): TemplateResult {
        if(state.status === Status.NO_DEVICE_MEDIA){
            return html`
            <style>
                .cont{
                    padding: 10px;
                    height: 100px;
                    min-width: 200px;
                }
            </style>
            <div class="cont">
                <lay-them in="column" ma="space-around" ca="stretch">
                    <div style="text-align: center;"><ut-p use="color:white">no_camera_found</ut-p></div>
                    <div @click=${this.bloc?.close}><labeled-icon-button icon="clear" label="close" use="primaryColor:white;color:white;"></labeled-icon-button></div> 
                </lay-them>
            </div>`;
        }else if(state.status === Status.INIT){
            return html`
            <style>
                .cont{
                    padding: 10px;
                    height: 100px;
                    min-width: 200px;
                }
            </style>
            <div class="cont">
                <lay-them in="column" ma="space-around" ca="stretch">
                    <div style="text-align: center;"><ut-p use="color:white">camera_permission</ut-p></div>
                    <div @click=${this.bloc?.close}><labeled-icon-button icon="clear" label="close" use="primaryColor:white;color:white;"></labeled-icon-button></div> 
                </lay-them>
            </div>`;
        }else if(state.status === Status.SCANNER_NOT_SUPPORTED){
            return html`<ut-p use="color:white">qr_scanner_not_supported</ut-p>`;
        }else{
            return html`
                <style>
                    .tool{
                        z-index: 12;
                        position: absolute;
                        min-width: 50px;
                        min-height:50px;
                    }
                    .count{
                        top: 10px;
                        left: 10px;
                        color: white;
                        background-color: #00000061;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        justify-content: center;
                        align-content: center;
                        align-items: center;
                    }
                </style>
                <div style="position: relative;display: flex;align-content: center;justify-content: center;">
                    <div class="tool count" style="top: 10px;left:10px;">${this.state?.codes?.length??0}</div>
                    <div class="tool" style="top: 10px;right:10px;" @click=${this.bloc?.close}><labeled-icon-button icon="clear" label="close" use="primaryColor:white;color:white;"></labeled-icon-button></div>
                    <div class="tool" style="bottom: 10px;right:10px;" @click=${this.bloc?.postQrCode}><labeled-icon-button icon="done" label="ok" use="primaryColor:white;color:white;"></labeled-icon-button></div>
                    <div class="tool" style="bottom: 10px;" @click=${this.bloc?.scan}><labeled-icon-button icon="qrcode" label="scan" use="primaryColor:white;color:white;"></labeled-icon-button></div>
                    <div class="tool" style="bottom: 10px;left:10px;" @click=${this.bloc?.toggle_torch}><labeled-icon-button icon="highlight" label="torch" use="primaryColor:white;color:white;"></labeled-icon-button></div>

                    <div><video style="max-width: 95vw;max-height: 95vh;" autoplay muted id="video_el"></video></div>
                </div>`;
        }
    }

}
customElements.define("ut-qr-code-camera-stream",QrCodeCameraStream);

export interface QrCodeScannerConfig{
    /**
     * Default value is qr code
     */
    formats?:string[];
    /**
     * A bloc of type : QrCodeListenerBloc.
     * Default name: QrCodeListenerBloc
     */
    notify_bloc_name?:string;

    /**
     * Sound to play for each scan
     */
    sound_url?:string;

    /**
     * undefined or zero, means no limits scans
     */
    scan_limit?:number;
}

class QrCodeScannerWidget extends WidgetBuilder<HideBloc,boolean>{
    public qrConfig?:QrCodeScannerConfig;

    constructor(){
        super("QrCodeHideBloc");
    }

    builder(state: boolean): TemplateResult {
        if(state){
            return html``;
        }else{
            return html`<style>
            .fullscreenGlass{
                position:fixed;
                width:100%;
                height: 100%;
                background-color: ${this.theme.dialogue_bg};
                display: block;
                z-index: 10;
                top: 0;
                left: 0;
            }
            .camera_preview{
                max-width: 95vw;
                max-height: 95vh;
                background-color: #00000042;
                color:white;
            }
            .close_button{
                position: absolute;
                top: 10px;
                right: 10px;
                width: 50px;
                height: 50px;
                z-index: 11;
            }
            </style>
            <div class="fullscreenGlass">
                <lay-them ma="center" ca="center">
                    <div class="camera_preview">
                        <ut-qr-code-camera-stream .qrConfig=${this.qrConfig}></ut-qr-code-camera-stream>
                    </div>
                </lay-them>
            </div>`;
        }
    }
}
customElements.define("ut-qr-code-widget",QrCodeScannerWidget);