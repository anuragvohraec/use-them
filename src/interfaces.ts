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
    INIT,
    NEW_IMAGE,
    DRAW,
    GIVE_IMAGE
}

export interface XY{
    x:number;
    y:number;
}

export interface NewImageConfig{
    origBlob:Blob;
    baseDimension:XY,
    opMaxLength:number;
}

export enum IEDrawPurpose{
    NEW_IMAGE,
    ZOOM,
    PAN,
    BRIGHTNESS,
    CONTRAST
}

/**
 * Blob is must for image loading
 */
export interface IEValue{
    brightness:number;
    contrast:number;
    zoom:number;
    pan:{x:number,y:number};
    draw_purpose:IEDrawPurpose;
    newImageConfig?:NewImageConfig
}

/**
 * Image editor message
 */
export interface IEMessage{
    type:IEMessageType,
    /**
     * if type == INIT , then value is OffscreenCanvas
     */
    value:IEValue|OffscreenCanvas;
}