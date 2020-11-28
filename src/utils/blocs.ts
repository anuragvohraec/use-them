import { Bloc, BlocBuilder, BlocType, BlocBuilderConfig } from "bloc-them";
import { Theme } from '../widgets/theme';

export class BogusBloc extends Bloc<number>{
    constructor(){
        super(0);
    }
}

export abstract class WidgetBuilder<B extends Bloc<S>, S> extends BlocBuilder<B,S>{
    private _theme : Theme;
    
    constructor(blocType: BlocType<S>, configs?: BlocBuilderConfig<B, S>){
        super(blocType, configs);
        let theme: Theme = (<any>document).useThemTheme; 
        this._theme={...theme,...this.useAttribute};
    }

    
    public get theme() : Theme {
        return this._theme;
    }
}