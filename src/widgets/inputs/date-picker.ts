import { Bloc, BlocsProvider } from "bloc-them";
import { html, TemplateResult } from 'lit-html';
import { DEFAULT_MIN_VERSION } from 'tls';
import { WidgetBuilder } from '../../utils/blocs';
import { RaisedButton } from '../buttons';
import { HideBloc } from '../dialogues';
import { FormBloc, FormMessageBloc } from '../forms';

enum DatePickerStatus{
    SHOW_DATE,
    SHOW_MONTH,
    SHOW_YEAR
}

interface DatePickerState{
    status:DatePickerStatus;
    year:number;
    month:number;
    date:number;
}

export interface DatePickerConfig{
    init_date:number,minYear:number,maxYear:number,formBlocName:string, nameForThisInForm:string,
    placeholder:string
}

class DatePickerBloc extends Bloc<DatePickerState>{
    
    protected _name: string="DatePickerBloc";
    
    static DayMap:Record<number,string>={
        0:"SUN",
        1:"MON",
        2:"TUE",
        3:"WED",
        4:"THU",
        5:"FRI",
        6:"SAT"
    }
    static MonthMap:Record<number,string>={
        0:"JAN",
        1:"FEB",
        2:"MAR",
        3:"APR",
        4:"MAY",
        5:"JUN",
        6:"JUL",
        7:"AUG",
        8:"SEP",
        9:"OCT",
        10:"NOV",
        11:"DEC"
    }

    constructor(private config: DatePickerConfig){
        super((():DatePickerState=>{
            const i = new Date(config.init_date);
            const iy= i.getFullYear();
            if(iy>=config.minYear && iy<=config.maxYear){
                let t = new Date(config.init_date);
                return {
                    date: t.getDate(),
                    month: t.getMonth(),
                    year: t.getFullYear(),
                    status: DatePickerStatus.SHOW_DATE
                };
            }else{
                throw `Init Date must be between min and max`;
            }
        })())
    }

    
    public get placeholder() : string {
        return this.config.placeholder;
    }
    

    show_months(){
        this.emit({...this.state, status: DatePickerStatus.SHOW_MONTH});
    }

    show_years(){
        this.emit({...this.state, status: DatePickerStatus.SHOW_YEAR});
    }

    show_dates(){
        this.emit({...this.state, status: DatePickerStatus.SHOW_DATE});
    }

    select_date(date:number){
        this.emit({...this.state, date});
    }
    
    select_month(month:number){
        this.emit({...this.state, month, status: DatePickerStatus.SHOW_DATE});
    }
    select_year(year:number){
        this.emit({...this.state, year, status: DatePickerStatus.SHOW_DATE});
    }

    postDateToForm(context:HTMLElement){
        let t = new Date();
        t.setDate(this.state.date);
        t.setMonth(this.state.month);
        t.setFullYear(this.state.year);
        let fm = BlocsProvider.of<FormMessageBloc,any>("FormMessageBloc",context);
        let fb = BlocsProvider.of<FormBloc,any>(this.config.formBlocName,context);
        fb!.delegateChangeTo(this.config.nameForThisInForm,t.getTime(),fm!);
    }

    
    public get dates_of_current_month() : number[] {
        const lastDay = new Date(this.state.year, this.state.month + 1, 0);
        const t = [ ...Array(lastDay.getDate()).keys() ].map( i => i+1);
        return t;
    }

    public get day_pattern_for_month(): string[]{
        const t = [0,1,2,3,4,5,6];
        const f = this.first_day_of_month.getDay();
        const p1 = t.splice(0,f);
        const r1 = t.concat(p1);
        return r1.map(e=>DatePickerBloc.DayMap[e]);
    }

    get date_obj():Date{
        return new Date(this.state.year,this.state.month,this.state.date);
    }
    
    get first_day_of_month():Date{
        const date = this.date_obj, y = date.getFullYear(), m = date.getMonth();
        const firstDay = new Date(y, m, 1); 
        return firstDay;
    }

    get last_day_of_month():Date{
        const date = this.date_obj, y = date.getFullYear(), m = date.getMonth();
        return new Date(y, m + 1, 0);
    }

    get month_list():number[]{
        return [0,1,2,3,4,5,6,7,8,9,10,11];
    }

    get year_list():number[]{
        const o = this.config.maxYear-this.config.minYear;
        const t = [ ...Array(o).keys() ].map( i => i+this.config.minYear);
        return t;
    }
}

class _DatePickerModalBody extends WidgetBuilder<DatePickerBloc,DatePickerState>{
    constructor(){
        super("DatePickerBloc");
    }

    builder(state: DatePickerState): TemplateResult {
        switch (state.status) {
            case DatePickerStatus.SHOW_DATE: {
                return html`
                <style>
                .container{
                    display:grid;
                    font-family: monospace;
                    grid-template-columns: auto auto auto auto auto auto auto;
                }
                .date{
                    width: 3em;
                    height: 3em;
                    text-align:center;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .day{
                    background-color: ${this.theme.primaryColor};
                    color: white;
                    text-align:center;
                }
                .dayheader{
                    padding: 10px 0px;
                }
                .selected{
                    background-color:  ${this.theme.primaryColor};
                    border-radius: ${this.theme.cornerRadius};
                    color: white;
                    font-weight: bold;
                    text-shadow: 0px 0px 2px white;
                }
                </style>
                <lay-them in="column" ma="flex-start" ca="stretch">
                    <div class="container">
                        ${this.bloc?.day_pattern_for_month.map(d=>html`<div class="day dayheader">${d}</div>`)}
                    </div>
                    <div class="container">
                        ${this.bloc?.dates_of_current_month.map(d=>{
                            return html`<div class="${d===state.date?'date selected':'date'}" @click=${()=>{
                                this.bloc?.select_date(d);
                            }}>${d}</div>`;
                        })}
                    </div>
                </lay-them>
                `;
            }
            case DatePickerStatus.SHOW_MONTH:{
                return html`
                <style>
                .container{
                    display:grid;
                    font-family: monospace;
                    grid-template-columns: auto auto auto auto;
                }
                .month{
                    width: 3em;
                    height: 3em;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                </style>
                <lay-them in="column" ma="flex-start" ca="stretch">
                    <div class="container">
                        ${this.bloc?.month_list.map(d=>{
                            return html`<div class="month" @click=${()=>{
                                this.bloc?.select_month(d);
                            }}>${DatePickerBloc.MonthMap[d]}</div>`;
                        })}
                    </div>
                </lay-them>
                `;
            }
            case DatePickerStatus.SHOW_YEAR:{
                return html`<style>
                .container{
                    display:grid;
                    font-family: monospace;
                    grid-template-columns: auto auto auto auto;
                    max-height: 300px;
                }
                .year{
                    padding:10px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                </style>
                <lay-them in="column" ma="flex-start" ca="stretch">
                    <div class="container">
                        ${this.bloc?.year_list.map(d=>{
                            return html`<div class="year" @click=${()=>{
                                this.bloc?.select_year(d);
                            }}>${d}</div>`;
                        })}
                    </div>
                </lay-them>`;
            };
        }
    }
}

customElements.define("date-picker-body",_DatePickerModalBody);

class DatePickerOKButton extends RaisedButton<HideBloc,boolean>{
    onPress(): void {
        const t= BlocsProvider.of<DatePickerBloc,any>("DatePickerBloc",this);
        t?.postDateToForm(this);
        this.bloc?.toggle();
    }

    constructor(){
        super("HideBloc");
    }
}
customElements.define("date-picker-ok-button", DatePickerOKButton);

class DatePickerModal extends WidgetBuilder<DatePickerBloc,DatePickerState>{
    constructor(){
        super("DatePickerBloc");
    }
    builder(state: DatePickerState): TemplateResult {
        return html`
            <style>
              .selectButton{
                  background-color: ${this.theme.primaryColor};
                  padding: 10px;
                color: white;
                flex:1;
                text-align: center;
              }
              .header{
                z-index: 10;
                padding: 10px;
                background-color: ${this.theme.primaryColor};
                border-radius: ${this.theme.cornerRadius} ${this.theme.cornerRadius} 0px 0px;
                color: white;
                font-size: 1.2em;
                box-shadow: 0px 20px 20px 0px #00000021;
              }  
            </style>
            <ut-ex>
                <div style="height:100%; background-color:white; border-radius: ${this.theme.cornerRadius};">
                    <lay-them in="column" ma="flex-start" ca="stretch">
                        <div class="header">${this.bloc?.placeholder}</div>
                        <div class="date_year_button">
                            <lay-them in="row" ma="space-between">
                                <div class="selectButton" @click=${()=>{
                                    this.bloc?.show_months();
                                }}>${DatePickerBloc.MonthMap[state.month]}</div>
                                <div class="selectButton" @click=${()=>{
                                    this.bloc?.show_years();
                                }}>${state.year}</div>
                            </lay-them>
                        </div>
                        <div>
                            <date-picker-body></date-picker-body> 
                        </div>
                        <div style="padding-top: 10px;">
                            <date-picker-ok-button use="background-color: ${this.theme.primaryColor};"><lay-them ma="center" ca="center"><iron-icon icon="done"></iron-icon></lay-them></date-picker-ok-button>
                        </div>
                    </lay-them>
                </div>
            </ut-ex>
        `;
    }
}
customElements.define("date-picker-modal",DatePickerModal);

class DatePickerInput extends WidgetBuilder<DatePickerBloc,DatePickerState>{
    private used:boolean=false;

    convert_sate_to_date_string(state:DatePickerState){
        return html`${state.date}-${DatePickerBloc.MonthMap[state.month]}-${state.year}`;
    }

    builder(state: DatePickerState): TemplateResult {
       return html`<div style="width: 100%; height:100%;" @click=${()=>{
           let t = BlocsProvider.of<HideBloc,any>("HideBloc",this);
           t?.toggle();
           this.used=true;
       }}>${(()=>{
           if(!this.used) {
               return html`<lay-them in="row" ma="space-between" ca="center"><div style="color: #808080; padding: 0px 10px;">${this.bloc?.placeholder}</div><div style="padding: 0px 10px;"><iron-icon icon="today" style="fill: #a7a7a7;"></iron-icon></div></lay-them><slot></slot>`;
           }else{
               return html`<lay-them in="row" ma="space-between" ca="center"><div style="padding: 0px 10px;">${this.convert_sate_to_date_string(state)}</div><div style="padding: 0px 10px;"><iron-icon icon="today" ></iron-icon></div></lay-them><slot></slot>`;
           }
       })()}</div>`;
    }
    constructor(){
        super("DatePickerBloc");
    }
}
customElements.define("date-picker-input",DatePickerInput);

export class DatePicker extends BlocsProvider{
    constructor(config:DatePickerConfig){
        super([
            new HideBloc(),
            new DatePickerBloc(config)
        ])
    }
    builder(): TemplateResult {
        return html`
        <div style="width: 100%; height: 40px; border-radius: 4px;background-color:#e6e6e6;font-family: monospace; user-select:none;">
            <date-picker-input>
                <ut-dialogue>
                    <lay-them ma="center" ca="center">
                        <date-picker-modal></date-picker-modal>
                    </lay-them>
                </ut-dialogue>
            </date-picker-input>
        </div>
        `;
    }
}

/**
 *     constructor(config:DatePickerConfig){
        super("DatePickerBloc",{
            useThisBloc: new DatePickerBloc(config)
        });
    }
 */