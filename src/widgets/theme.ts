import { Bloc, BlocsProvider } from "bloc-them";
import { TemplateResult, html } from 'lit-html';


export class Theme{
    public primaryColor: string ="#ff2052";
    public secondaryColor: string = "#4e00ec";

    public iconColor: string ="#ffffff";

    public backgroundColor: string = "#ededed";
    public cornerRadius : string = "4px";

    public input_bg_color="#00000054";
    public input_height="50px";
    public input_padding="5px 10px";
    public input_cursor_color:string= "#ffffff";
    public input_text_color="#ffffff";
    public input_place_holder_color="#d2d2d2";
    public input_icon_color="#ffffff";
    public input_font_weight="normal";
    public input_checkbox_active_color=this.primaryColor;
    public input_check_mark_color="#eee";

    public button_disable_color="#0000008c";

    public snack_bar_bg="#000000b3";

    public glass_black="#0000008c";

    public P_font_size:string = "1em";
    public H3_font_size:string = "1.3em";
    public H2_font_size:string="1.6em";
    public H1_font_size:string = "2em";
    public H5_font_size:string ="0.7em";
    public H6_font_size:string ="0.5em";

    public color: string ="black";

    public tab_inactive_color="#dbdbdb";
    public tab_inactive_icon_color="#919191";
    public tab_active_icon_color="#ff2052";
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