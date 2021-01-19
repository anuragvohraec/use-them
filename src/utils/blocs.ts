import { Bloc, BlocBuilder,BlocBuilderConfig } from "bloc-them";
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

    public get theme() : Theme {
        return this._theme;
    }
}
