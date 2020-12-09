import { Bloc, BlocsProvider } from "bloc-them";
import { TemplateResult, html } from 'lit-html';


export class Theme{
    public primaryColor: string ="#ff2052";
    public secondaryColor: string = "#4e00ec";

    public iconColor: string ="#ffffff";

    public backgroundColor: string = "#ededed";
    public cornerRadius : string = "10px";

    public input_bg_color="#00000054";
    public input_height="80px";
    public input_padding="40px 20px";
    public input_cursor_color:string= "#ffffff";
    public input_text_color="#ffffff";
    public input_place_holder_color="#d2d2d2";
    public input_icon_color="#ffffff";

    public button_disable_color="#0000008c";

    public snack_bar_bg="#000000b3";

    public glass_black="#0000008c";

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