import { Bloc, BlocsProvider } from "bloc-them";
import { TemplateResult, html } from 'lit-html';


export class Theme{
    public primaryColor: string ="#ff2052";
    public secondaryColor: string = "#4e00ec";

    public iconColor: string ="#ffffff";

    public backgroundColor: string = "#ededed";
    public cornerRadius : number = 10;
}


export class ThemeBloc extends Bloc<Theme>{
    constructor(initTheme: Theme){
        super(initTheme);
    }
    changeTheme(newTheme: Theme){
        this.emit(newTheme);
    }
}

export abstract class ThemeProvider extends BlocsProvider{
    constructor(theme: Theme){
        super([new ThemeBloc(theme)]);
        (<any>document).useThemTheme=theme;
    }
    builder(): TemplateResult {
       return html`<div><slot></slot></div>`;
    }
}