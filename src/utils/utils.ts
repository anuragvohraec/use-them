
export class ColorUtil{
    static shadeColor(color:string, percent:number, AA:string="ff") {

        let R = parseInt(color.substring(1,3),16);
        let G = parseInt(color.substring(3,5),16);
        let B = parseInt(color.substring(5,7),16);
    
        R = Math.floor(R * (100 + percent) / 100);
        G = Math.floor(G * (100 + percent) / 100);
        B = Math.floor(B * (100 + percent) / 100);
    
        R = (R<255)?R:255;  
        G = (G<255)?G:255;  
        B = (B<255)?B:255;  
    
        var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    
        return "#"+RR+GG+BB+AA;
    }
}


export class Utils{
    /**
   * * build_path("https://my.com/proxy/db","/some1/db?a=12") > "https://my.com/proxy/db/some1/db?a=12"
   * * build_path("https://my.com/proxy/db/","/some1/db?a=12") > "https://my.com/proxy/db/some1/db?a=12"
   * @param args 
   */
  static build_path(...args:string[]):string{
    return args.map((part, i) => {
      if (i === 0) {
        return part.trim().replace(/[\/]*$/g, '')
      } else {
        return part.trim().replace(/(^[\/]*|[\/]*$)/g, '')
      }
    }).filter(x=>x.length).join('/')
  }
  
  }
  