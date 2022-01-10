import { IEInitConfig, IEMessage,IEMessageType, IEValue, XY } from "./src/interfaces";

const worker_ctx: Worker = self as any;

let initConfig:IEInitConfig;
let ctx:OffscreenCanvasRenderingContext2D;
let imageBitMap:ImageBitmap;
let opDim:XY={x:0,y:0};

let isInitialized:Promise<boolean>;

async function process(msg:IEMessage){
    switch (msg.type) {
        case IEMessageType.NEW_IMAGE:{
            isInitialized= new Promise(async res=>{
                initConfig=msg.value.initConfig!;
                
                imageBitMap = await createImageBitmap(initConfig.origBlob);
                setOPDimension();
                initConfig.canvas.width=opDim.x;
                initConfig.canvas.height=opDim.y;

                let t = initConfig.canvas.getContext("2d");
                if(t){
                    ctx=t;
                }
                draw(msg.value);
                res(true);
            });
        }break;
        case IEMessageType.DRAW:{
            await isInitialized;
            draw(msg.value);
        }break;
        default: break;
    }
}

function setOPDimension(){
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
}

function draw(value:IEValue){
    ctx.filter = `brightness(${value.brightness+100}%) contrast(${100+value.contrast}%)`;
    ctx.rect(0, 0, 300, 300);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.drawImage(imageBitMap,0,0,imageBitMap.width,imageBitMap.height,value.pan.x,value.pan.y,opDim.x*value.zoom,opDim.y*value.zoom);
}

worker_ctx.onmessage=(e:MessageEvent<IEMessage>)=>{
    process(e.data);
}