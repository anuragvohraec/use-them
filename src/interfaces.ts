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