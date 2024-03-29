import { Bloc, ListenerWidget } from "bloc-them";
import { TemplateResult, html } from 'bloc-them';


export class Theme{
    public primaryColor: string ="#ff2052";
    public secondaryColor: string = "#4e00ec";

    public iconColor: string ="#ffffff";

    public backgroundColor: string = "#ededed";
    public cornerRadius : string = "4px";

    public input_bg_color="#e6e6e6";
    public input_height="40px";
    public input_padding="5px 10px";
    public input_cursor_color:string= "#ffffff";
    public input_text_color="#000000";
    public input_place_holder_color="#808080";
    public input_icon_color="#a7a7a7";
    public input_font_weight="normal";

    public input_checkbox_active_color=this.primaryColor;
    public input_check_mark_color=this.input_bg_color
    public input_checkbox_hover=this.input_bg_color;

    public input_radio_button_active_color=this.primaryColor;

    public button_disable_color="#0000008c";
    public button_height="40px";

    public snack_bar_bg="#000000b3";

    public glass_black="#0000008c";

    public dialogue_bg=this.glass_black;

    public P_font_size:string = "1em";
    public H3_font_size:string = "1.1em";
    public H2_font_size:string="1.2em";
    public H1_font_size:string = "1.5em";
    public H5_font_size:string ="0.8em";
    public H6_font_size:string ="0.6em";

    public color: string ="black";

    public tab_inactive_color="#dbdbdb";
    public tab_inactive_icon_color="#919191";
    public tab_active_icon_color=this.primaryColor;
    
    public tab_header_margin="inherit";
    public tab_header_border_radius="inherit";
    public tab_header_overflow="inherit";
    public tab_header_shadow="none";
    public tab_header_zIndex="inherit";
    public tab_header_bar_shadow="none";
    public tab_header_height="50px";
    public tab_header_padding="0px";

    public selector_item_selection_color=this.primaryColor;

    public icon_active=this.primaryColor;
    public icon_inactive="#919191";
    public icon_stroke="#0000";
    public icon_size="20px";

    public vTab_inactiveColor="#dbdbdb";
    public vTab_activeColor="transparent";

    public vTab_active_icon_color=this.primaryColor;
    public vTab_inactive_icon_color="#919191";

    public scaffold_menu_icon_color="#fff";
    public scaffold_title_background_shadow="0px 0px 4px black";
    public scaffold_title_bar_default_background_display="block";
    public scaffold_menu_glass_color=this.glass_black;
    public scaffold_menu_shadow="0px 0px 30px black";
    public scaffold_title_bar_border_radius="0px";

    public confirmation_dialogue_title_bar_image="inherit";
    public confirmation_dialogue_border_radius=this.cornerRadius;

    public toggleButtonOnColor=this.primaryColor;

    public backable_screen_border_radius="0px";
    public app_bar_max_width="inherit";
}


export class ThemeBloc extends Bloc<Theme>{
    protected _name: string="ThemeBloc";
    
    constructor(initTheme: Theme){
        super(initTheme);
    }
    changeTheme(newTheme: Theme){
        this.emit(newTheme);
    }
}

export abstract class ThemeProvider extends ListenerWidget{
    constructor(theme: Theme){
        super({
            hostedBlocs:{ThemeBloc:new ThemeBloc(theme)},
            isShadow: true
        });
        (<any>document).useThemTheme=theme;
    }
    build(): TemplateResult {
       return html`<div style="width:100%; height: 100%;"><slot></slot></div>`;
    }
}