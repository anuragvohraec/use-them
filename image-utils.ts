import { IncomingRequest, ImageSize } from "./src/interfaces";

const worker_ctx: Worker = self as any;

function compressAndResizeImage(data:IncomingRequest){
    const defValue={
        width:15,
        height:15,
        quality:0.5,
        type:"image/webp"
    }
    const d:IncomingRequest ={...defValue,...data};
    
    createImageBitmap(d.file).then(ib=>{
        const imgSize = resizeSizeMaintainingAspectRatio(ib.width,ib.height,d.max_length);
        const canvas  = new OffscreenCanvas(imgSize.width,imgSize.height);
        const ctx = canvas.getContext("2d");
        ctx!.drawImage(ib,0,0,imgSize.width,imgSize.height);
        const blob = canvas.convertToBlob({
            type:d.type,
            quality: d.quality
        });
        return blob;
    }).then(b=>{
        worker_ctx.postMessage({id: d.id, file: b});
    })
}



function resizeSizeMaintainingAspectRatio(width:number, height:number, maxLength:number):ImageSize{
    if(width>maxLength || height> maxLength){
      if(width>height){
          return {
              width: maxLength,
              height: Math.floor((height*maxLength/width))
          }
      }else{
        return {
            width: Math.floor(width*maxLength/height),
            height: maxLength
        };
      }
    }else{
      //both of them are definitely smaller than 500
      return {width,height}
    }
  }

worker_ctx.onmessage=(e:MessageEvent)=>{
    compressAndResizeImage(e.data);
}