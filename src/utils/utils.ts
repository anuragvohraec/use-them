import { ImageSize, IncomingRequest } from "../interfaces";

export class ColorUtil {
  static shadeColor(color: string, percent: number, AA: string = "ff") {

    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.floor(R * (100 + percent) / 100);
    G = Math.floor(G * (100 + percent) / 100);
    B = Math.floor(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB + AA;
  }
}


export class Utils {
  /**
 * * build_path("https://my.com/proxy/db","/some1/db?a=12") > "https://my.com/proxy/db/some1/db?a=12"
 * * build_path("https://my.com/proxy/db/","/some1/db?a=12") > "https://my.com/proxy/db/some1/db?a=12"
 * @param args 
 */
  static build_path(...args: string[]): string {
    return args.map((part, i) => {
      if (i === 0) {
        return part.trim().replace(/[\/]*$/g, '')
      } else {
        return part.trim().replace(/(^[\/]*|[\/]*$)/g, '')
      }
    }).filter(x => x.length).join('/')
  }

  static async compressAndResizeImage(data: IncomingRequest) {
    try {
      const defValue = {
        width: 15,
        height: 15,
        quality: 0.5,
        type: "image/webp"
      }
      const d: IncomingRequest = { ...defValue, ...data };

      const ib = await createImageBitmap(d.file);
      const imgSize = Utils.resizeSizeMaintainingAspectRatio(ib.width, ib.height, d.max_length);
      const canvas = new OffscreenCanvas(imgSize.width, imgSize.height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(ib, 0, 0, imgSize.width, imgSize.height);
        const blob = canvas.convertToBlob({
          type: d.type,
          quality: d.quality
        });
        return blob;
      } else {
        throw "Cannot acquire 2d context for image compression!";
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }


  static resizeSizeMaintainingAspectRatio(width: number, height: number, maxLength: number): ImageSize {
    if (width > maxLength || height > maxLength) {
      if (width > height) {
        return {
          width: maxLength,
          height: Math.floor((height * maxLength / width))
        }
      } else {
        return {
          width: Math.floor(width * maxLength / height),
          height: maxLength
        };
      }
    } else {
      //both of them are definitely smaller than 500
      return { width, height }
    }
  }

  static getVideoCover(file: Blob, seekTo = 0.0): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // load the file to a video player
      const videoPlayer = document.createElement('video');
      videoPlayer.setAttribute('src', URL.createObjectURL(file));
      videoPlayer.load();
      videoPlayer.addEventListener('error', (ex) => {
        reject(ex);
      });
      // load metadata of the video to get video duration and dimensions
      videoPlayer.addEventListener('loadedmetadata', () => {
        // seek to user defined timestamp (in seconds) if possible
        if (videoPlayer.duration < seekTo) {
          reject("video is too short.");
          return;
        }
        // delay seeking or else 'seeked' event won't fire on Safari
        setTimeout(() => {
          videoPlayer.currentTime = seekTo;
        }, 200);
        // extract video thumbnail once seeking is complete
        videoPlayer.addEventListener('seeked', () => {
          // define a canvas to have the same dimension as the video
          const canvas = document.createElement("canvas");
          canvas.width = videoPlayer.videoWidth;
          canvas.height = videoPlayer.videoHeight;
          // draw the video frame to canvas
          const ctx = canvas.getContext("2d");
          ctx!.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
          // return the canvas image as a blob
          ctx!.canvas.toBlob(
            blob => {
              resolve(blob!);
            },
            "image/jpeg",
            0.75 /* quality */
          );
        });
      });
    });
  }

  static formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  private static readonly ONE_MINUTE=60*1000;
  private static readonly ONE_HOUR=60*Utils.ONE_MINUTE;

  static covertToPlayTime(time:number){
      if(!time){
          return `0:0`;
      }
      if(time===Infinity){
          return `Streaming...`;
      }
      time*=1000;
      let et = Math.floor(time);//effective time
      const h = Math.floor(et/this.ONE_HOUR);
      const hr = et%this.ONE_HOUR;
      const m = Math.floor(hr/this.ONE_MINUTE);
      const mr=hr%this.ONE_MINUTE;
      const s = Math.floor(mr/1000);
      return `${h>0?`${h}`+":":""}${("0"+m).slice(-2)}:${("0"+s).slice(-2)}`;
  }

  static parseAttributeValue(attrString: string|null){
      let result:Record<string,string>={};
      if(attrString){
          let t1 = attrString.split(";");
          for(let t2 of t1){
              let t3 = t2.split(":");
              if(t3.length===2){
                  result[t3[0].trim()]=t3[1].trim();
              }
          }            
      }
      return result;
  }

}
