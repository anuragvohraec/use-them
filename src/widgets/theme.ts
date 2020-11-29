import { Bloc, BlocsProvider } from "bloc-them";
import { TemplateResult, html } from 'lit-html';


export class Theme{
    public primaryColor: string ="#ff2052";
    public secondaryColor: string = "#4e00ec";

    public iconColor: string ="#ffffff";

    public backgroundColor: string = "#ededed";
    public cornerRadius : number = 10;

    public P_font_size:string = "2em";
    public H3_font_size:string = "2.5em";
    public H2_font_size:string="3.5em";
    public H1_font_size:string = "4.5em";
    public H5_font_size:string ="1.5em";
    public H6_font_size:string ="1.2em";

    public color: string ="black";
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
       return html`<div style="width:100%; height: 100%;"><slot></slot></div>`;
    }
}