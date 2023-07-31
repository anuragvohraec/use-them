import { Bloc, ListenerWidget } from "bloc-them";
import { Theme } from '../widgets/theme';
import { Utils } from "./utils";


export abstract class ActionBloc<S> extends Bloc<S>{
    constructor(initState: S){
        super(initState);
    }
}

export class BogusBloc extends ActionBloc<number>{
    protected _name: string="BogusBloc";

    constructor(){
        super(0);
    }
}


export abstract class WidgetBuilder<S=any> extends ListenerWidget<S>{
    protected _theme : Theme;
    protected useAttribute?:Record<string,string>;
    
    constructor(blocName: string, hostedBlocs?: Record<string, Bloc<any>>){
        super({
            blocName,
            isShadow: true,
            hostedBlocs
        });
        let theme: Theme = (<any>document).useThemTheme; 
        if(this.hasAttribute("use")){
            this.useAttribute = Utils.parseAttributeValue(this.getAttribute("use"));
            this._theme={...theme,...this.useAttribute}
        }else{
            this._theme={...theme};
        }
    }

    public  static get observedAttributes() : string[]{
        return ["use"];
    }
    
    attributeChangedCallback(name:string, oldValue:string, newValue:string) {
        if(name==="use"){
            const t = Utils.parseAttributeValue(newValue);
            this._theme={...this._theme,...t};
            if(this.bloc() && newValue){
                this.rebuild(this.bloc()?.state);
            }
        }
    }

    public get theme() : Theme {
        return this._theme;
    }
}


/**
 * The sole purpose of this bloc is to attach items and receive where ever needed.
 */
export class UtRegistryBloc extends Bloc<string>{
    protected _name: string="UtRegistryBloc";
    private static readonly registry: Record<string, any> = {};

    private constructor(){
        super("");
    }

    static add(key:string,item:any){
        this.registry[key]=item;
    }

    static get<T>(key:string){
        return this.registry[key] as T;
    }

    static remove(key:string){
        delete this.registry[key];
    }
}