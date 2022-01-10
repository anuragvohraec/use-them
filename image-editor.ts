import { NewImageConfig, IEMessage,IEMessageType, IEValue, XY } from "./src/interfaces";

const worker_ctx: Worker = self as any;

let initConfig:NewImageConfig;
let canvas:OffscreenCanvas;
let ctx:OffscreenCanvasRenderingContext2D;
let imageBitMap:ImageBitmap;
let opDim:XY={x:0,y:0};
let offset_for_center:XY={x:0,y:0};
let isInitialized:Promise<boolean>;

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
    
    offset_for_center={x:0,y:0};
}

function draw(value:IEValue){
    //offsetting to center
    value.pan.x=value.pan.x+offset_for_center.x;
    value.pan.y=value.pan.y+offset_for_center.y;

    ctx.filter = `brightness(${value.brightness+100}%) contrast(${100+value.contrast}%)`;
    ctx.rect(0, 0, 300, 300);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.drawImage(imageBitMap,0,0,imageBitMap.width,imageBitMap.height,value.pan.x,value.pan.y,opDim.x*value.zoom,opDim.y*value.zoom);
}

worker_ctx.onmessage=(e:MessageEvent<IEMessage>)=>{
    process(e.data);
}