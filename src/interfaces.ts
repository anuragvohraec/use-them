export interface IncomingRequest{
    id:string;
    /**
     * Max length of any side, that is output width or height cannot be greater than this length.
     */
    max_length:number;
    quality:number;
    file:Blob;
    type:string;
}



export interface ImageSize{
    width: number;
    height: number;
}

export interface InfoAboutAFile{size:number,ext:string, name:string}


export interface PickedFileInfoForOutPut{file_name:string, fileBlob:Blob, fileHashBlob?:Blob, fileHash?:number[]}

/**
 * Image editor message type
 */
export enum IEMessageType{
    NEW_IMAGE,
    DRAW
}

export interface XY{
    x:number;
    y:number;
}

export interface IEInitConfig{
    origBlob:Blob;
    canvas:OffscreenCanvas;
    baseDimension:XY,
    opMaxLength:number;
}

/**
 * Blob is must for image loading
 */
export interface IEValue{
    brightness:number;
    contrast:number;
    zoom:number;
    pan:{x:number,y:number};
    initConfig?:IEInitConfig
}

/**
 * Image editor message
 */
export interface IEMessage{
    type:IEMessageType,
    value:IEValue
}