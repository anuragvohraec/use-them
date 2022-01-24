import { UseThemConfiguration } from "./src/configs";
import { NewImageConfig, IEMessage,IEMessageType, IEValue, XY, IEDrawPurpose } from "./src/interfaces";

const worker_ctx: Worker = self as any;

let initConfig:NewImageConfig;
let canvas:OffscreenCanvas;
let ctx:OffscreenCanvasRenderingContext2D;
let imageBitMap:ImageBitmap;
let opDim:XY={x:0,y:0};
let offset_for_center:XY={x:0,y:0};
let isInitialized:Promise<boolean>;
let takeSnapTimer:any;
let currentW:number=0;
let currentH:number=0;

async function process(msg:IEMessage){
    switch (msg.type) {
        case IEMessageType.INIT:{
            canvas=(msg.value as OffscreenCanvas);
            let t = canvas.getContext("2d");
            if(t){
                ctx=t;
            } 
        }break;
        case IEMessageType.NEW_IMAGE:{
            isInitialized= new Promise(async res=>{
                let value = (msg.value as IEValue);
                if(value.newImageConfig){
                    initConfig=value.newImageConfig!;
                
                    // initConfig.canvas.width=initConfig.baseDimension.x;
                    // initConfig.canvas.height=initConfig.baseDimension.y;

                    imageBitMap = await createImageBitmap(initConfig.origBlob);
                    resetOutputDimension();
                    
                    //center image
                    if(opDim.x<canvas.width){
                        offset_for_center.x=Math.floor((canvas.width-opDim.x)/2);
                    }

                    if(opDim.y<canvas.height){
                        offset_for_center.y=Math.floor((canvas.height-opDim.y)/2);
                    }

                    res(true);
                }else{
                    res(false);
                }
            });
        };
        case IEMessageType.DRAW:{
            if(isInitialized && await isInitialized){
                draw(msg.value as IEValue);
            }
        }break;
        case IEMessageType.GIVE_IMAGE:{
            const blob = await canvas.convertToBlob({type:"image/webp",quality:1});
            worker_ctx.postMessage({blob});
        }
        default: break;
    }
}

function resetOutputDimension(){
    let vidw=0;
    let vidh=0;

    const opWidth=initConfig.opMaxLength;
    const opHeight=initConfig.opMaxLength;

    vidw = imageBitMap.width;
    vidh = imageBitMap.height;
    
    if (vidw > opWidth && vidw >= vidh ) { vidh = ~~(vidh *= opWidth / vidw); vidw = opWidth;}
    if (vidh >= opHeight) { vidw = ~~(vidw *= opHeight / vidh); vidh = opHeight;}
    opDim.x=vidw;
    opDim.y=vidh;
    
    currentH=vidh;
    currentW=vidw;

    offset_for_center={x:0,y:0};
}

function draw(value:IEValue){
    //offsetting to center
    value.pan.x=value.pan.x+offset_for_center.x;
    value.pan.y=value.pan.y+offset_for_center.y;

    ctx.filter = `brightness(${value.brightness+100}%) contrast(${100+value.contrast}%)`;
    ctx.fillRect(0, 0, initConfig.opMaxLength, initConfig.opMaxLength);
    ctx.fillStyle = "white";
    ctx.fill();
    const w = currentW*value.zoom;
    const h= currentH*value.zoom;
    ctx.drawImage(imageBitMap,0,0,imageBitMap.width,imageBitMap.height,value.pan.x,value.pan.y,w,h);
    if(takeSnapTimer){
        clearTimeout(takeSnapTimer);
        takeSnapTimer=undefined;
    }
    if(value.draw_purpose===IEDrawPurpose.ZOOM){
        takeSnapTimer=setTimeout(()=>{
            currentW=w;
            currentH=h;
        },UseThemConfiguration.IMAGE_EDIT_ZOOM_RESPONSE_TIME);
    }
}

worker_ctx.onmessage=(e:MessageEvent<IEMessage>)=>{
    process(e.data);
}