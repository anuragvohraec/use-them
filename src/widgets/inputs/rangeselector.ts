import { FormInputBuilder, FormBloc, FormState } from '../forms';
import { TemplateResult, html } from 'lit-html';
import { BlocType } from 'bloc-them';

export interface Range{
    start: number;
    end: number;
}

export class RangeSelector<F extends FormBloc> extends FormInputBuilder<Range,F>{
    private max:number;
    private min:number;
    private isint:boolean;
    private start?:number;
    private end?: number;
    private width?:number;

    private start_drag_on: boolean=false;

    
    
    builder(state: FormState): TemplateResult {
        return html`
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   width="100%"
   height="100px"
   version="1.1"
   id="svg8">
  <defs
     id="defs2">
    <linearGradient
       id="linearGradient1197">
      <stop
         style="stop-color:${this.theme.secondaryColor};stop-opacity:1"
         offset="0"
         id="stop1193" />
      <stop
         style="stop-color:${this.theme.primaryColor};stop-opacity:1"
         offset="1"
         id="stop1195" />
    </linearGradient>
    <filter
       style="color-interpolation-filters:sRGB;"
       id="filter1157">
      <feFlood
         flood-opacity="0.666667"
         flood-color="rgb(0,0,0)"
         result="flood"
         id="feFlood1147" />
      <feComposite
         in="flood"
         in2="SourceGraphic"
         operator="in"
         result="composite1"
         id="feComposite1149" />
      <feGaussianBlur
         in="composite1"
         stdDeviation="0.989644"
         result="blur"
         id="feGaussianBlur1151" />
      <feOffset
         dx="0"
         dy="0"
         result="offset"
         id="feOffset1153" />
      <feComposite
         in="SourceGraphic"
         in2="offset"
         operator="over"
         result="composite2"
         id="feComposite1155" />
    </filter>
    <linearGradient
       xlink:href="#linearGradient1197"
       id="linearGradient1199"
       x1="13.141692"
       y1="15.874999"
       x2="500"
       y2="15.874999"
       gradientUnits="userSpaceOnUse" />
    <filter
       style="color-interpolation-filters:sRGB;"
       id="filter1261"
       height="1.6700000000000004"
       width="1.5700000000000003"
       x="-0.30000000000000016"
       y="-0.30000000000000016">
      <feFlood
         flood-opacity="0.666667"
         flood-color="rgb(0,0,0)"
         result="flood"
         id="feFlood1251" />
      <feComposite
         in="flood"
         in2="SourceGraphic"
         operator="in"
         result="composite1"
         id="feComposite1253" />
      <feGaussianBlur
         in="composite1"
         stdDeviation="4.58947"
         result="blur"
         id="feGaussianBlur1255" />
      <feOffset
         dx="0"
         dy="0"
         result="offset"
         id="feOffset1257" />
      <feComposite
         in="SourceGraphic"
         in2="offset"
         operator="over"
         result="composite2"
         id="feComposite1259" />
    </filter>
  </defs>
  <metadata
     id="metadata5">
    <rdf:RDF>
      <cc:Work
         rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title></dc:title>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <g
     id="layer1">
    <rect
       style="fill:${this.theme.input_bg_color};stroke-width:0.477727;stroke-linejoin:round;stroke-opacity:0.658819"
       id="base"
       width="100%"
       height="15"
       x="0"
       y="50" />
    <rect
       style="fill:url(#linearGradient1199);fill-opacity:1;stroke-width:0.477727;stroke-linejoin:round;stroke-opacity:0.658819"
       id="active-range"
       width="100%"
       height="15"
       x="0"
       y="50" />
    <circle
       style="fill:${this.theme.secondaryColor};cursor: move;fill-opacity:1;filter:url(#filter1261);stroke:#ffffff;stroke-miterlimit:5;stroke-dasharray:none"
       id="start-handle"
       cx="calc(0% + 30)"
       cy="60"
       r="30"
       @touchstart=${this._start_drag_on}
       @touchend=${this._start_drag_off}
       @touchmove=${this._start_dragHandler}
       />
    <circle
       style="fill:${this.theme.primaryColor};cursor: move;fill-opacity:1;filter:url(#filter1261);stroke:#ffffff;stroke-miterlimit:4;stroke-dasharray:none"
       id="end-handle"
       cx="calc(100% - 30)"
       cy="60"
       r="30"/>
  </g>
</svg>
        `;
    }

    
    private _calculate_width() : number {
       let t = this.shadowRoot?.querySelector("svg");
       return t!.clientWidth;
    }
    

    _start_drag_on= (e:TouchEvent)=>{
     this.start_drag_on=true;
   }

   _start_drag_off=(e:TouchEvent)=>{
      this.start_drag_on=false;
   }

   _start_drag=(e: TouchEvent)=>{
      if(this.start_drag_on){
        let p = this.calculatePercentageForStart(e);
        this.setStartReading(p);
     }else{
        console.log("no drag on");
     }
   }


   _start_dragHandler ={
      handleEvent: this._start_drag,
      passive: true
   }

   private calculatePercentageForStart = (e:TouchEvent):number=>{
      let posX = e.changedTouches[0].clientX;
      let diff = posX - this.left!;
      let maxExtent = this.width!-60;
      if(diff < 0){
         return 0;
      }else if(diff>maxExtent){
         diff = maxExtent;
      }
      let r =  diff*100/this.width!;
      if(r>this.end!){
         return this.end!;
      }else{
         return r;
      }
   }

    constructor(type: BlocType<F,FormState>){
        super(type);
        let max = this.getAttribute("max");
        let min = this.getAttribute("min");

        if(!(max && min)){
            throw `Not all attributes provided for a range selector: min and max`;
        }else{
            this.max = Number(max);
            this.min = Number(min);
        }
        
        let isint = this.getAttribute("isint");
        this.isint = isint?true:false;
    }

    private left?:number;

    connectedCallback(){
       super.connectedCallback();
       this.start = this.bloc?.state.priceRange.start;
       this.end = this.bloc?.state.priceRange.end;
         if(!(this.start ==0 ||(this.start && this.start>=0) && this.end ==0 || (this.end && this.end>=0))){
            throw `No start and end provided for range selector in form initialization for : ${this.name}`
         }

         if(this.start! > this.end!){
            throw `For a range selector start cannot be less then end value, please check initialization of rang selector: ${this.name}`;
         }
         
         this.setStartReading(this.start!);
         this.setEndReading(this.end!);
         
         this.width = this._calculate_width();
         this.left = this.shadowRoot?.querySelector("svg")?.clientLeft;
    }

    private setStartReading(percentage: number){
       this.shadowRoot?.querySelector("#start-handle")?.setAttribute("cx",`calc(${percentage}% + 30)`);
       this.shadowRoot?.querySelector("#active-range")?.setAttribute("x",`calc(${percentage}%)`);
    }

    private setEndReading(percentage: number){
      this.shadowRoot?.querySelector("#end-handle")?.setAttribute("cx",`calc(${percentage}% - 30)`);
      this.shadowRoot?.querySelector("#active-range")?.setAttribute("width",`calc(${percentage-this.start!}%)`);
   }
}