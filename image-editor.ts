import { UseThemConfiguration } from "./src/configs";
import { NewImageConfig, IEMessage,IEMessageType, IEValue, XY, IEDrawPurpose } from "./src/interfaces";

const worker_ctx: Worker = self as any;

let initConfig:NewImageConfig;
let canvas:OffscreenCanvas;
let ctx:OffscreenCanvasRenderingContext2D;
let imageBitMap:ImageBitmap;

let isInitialized:Promise<boolean>;
let takeSnapTimer:any;

const opDim:XY={x:0,y:0};

let currentWH:XY={x:0,y:0};
let currentPos:XY={x:0,y:0};
let currentPan:XY={x:0,y:0};

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

                    imageBitMap = await createImageBitmap(initConfig.origBlob);
                    resetOutputDimension(value);

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

function resetOutputDimension(ieInitValue:IEValue){
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
    
    currentWH={x:vidw,y:vidh};
    currentPos={
        x: Math.floor((canvas.width-opDim.x)/2),
        y: Math.floor((canvas.height-opDim.y)/2)
    };
}

function draw(value:IEValue){
    //offsetting to center
    currentPos.x=currentPos.x+value.currentPos.x-value.axis.x;
    currentPos.y=currentPos.y+value.currentPos.y-value.axis.y;

    ctx.filter = `brightness(${value.brightness+100}%) contrast(${100+value.contrast}%)`;
    ctx.fillRect(0, 0, initConfig.opMaxLength, initConfig.opMaxLength);
    ctx.fillStyle = "white";
    ctx.fill();
    
    const w = currentWH.x*value.zoom;
    const h= currentWH.y*value.zoom;

    ctx.drawImage(imageBitMap,0,0,imageBitMap.width,imageBitMap.height,currentPos.x,currentPos.y,w,h);
    if(takeSnapTimer){
        clearTimeout(takeSnapTimer);
        takeSnapTimer=undefined;
    }
    if(value.draw_purpose===IEDrawPurpose.ZOOM){
        takeSnapTimer=setTimeout(()=>{
            currentWH={x:w,y:h}
        },UseThemConfiguration.IMAGE_EDIT_ZOOM_RESPONSE_TIME);
    }
}

worker_ctx.onmessage=(e:MessageEvent<IEMessage>)=>{
    process(e.data);
}