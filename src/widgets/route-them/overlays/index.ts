import { Bloc } from "bloc-them";

export interface OverlayStatus{
    show:boolean,
    overlay_id?:string;
}

export class OverlayPageBloc extends Bloc<OverlayStatus>{
    protected _name: string="OverlayPageBloc";

    constructor(){
        super({
            show:false
        });
    }

    hide(overlay_id:string){
        this.emit({show:false,overlay_id});
    }
}