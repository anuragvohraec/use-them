import { Bloc, BlocBuilder,BlocBuilderConfig, BlocsProvider } from "bloc-them";
import { Theme } from '../widgets/theme';


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

export abstract class WidgetBuilder<B extends Bloc<S>, S> extends BlocBuilder<B,S>{
    private _theme : Theme;
    
    constructor(blocName: string, configs?: BlocBuilderConfig<B, S>){
        super(blocName, configs);
        let theme: Theme = (<any>document).useThemTheme; 
        this._theme={...theme,...this.useAttribute};
    }

    public  static get observedAttributes() : string[]{
        return ["use"];
    }
    
    attributeChangedCallback(name:string, oldValue:string, newValue:string) {
        if(name==="use"){
            const t = WidgetBuilder.parseUseAttribute(newValue);
            this._theme={...this._theme,...t};
            if(this.bloc && newValue){
                this._build(this.bloc!.state);
            }
        }
    }

    public get theme() : Theme {
        return this._theme;
    }
}


export abstract class NoBlocWidgetBuilder extends WidgetBuilder<BogusBloc,number>{
    constructor(){
        super("BogusBloc", {useThisBloc: new BogusBloc()})
    }
}

export abstract class NoBlocNoStateWidget extends BlocsProvider{
    constructor(){
        super({});
    }
}