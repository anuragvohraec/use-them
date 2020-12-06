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

    private isDraging: boolean=false;

    
    
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
       r="${this.handleRadius}"
       @touchstart=${this._drag_ON}
       @touchend=${this._drag_OFF}
       @touchmove=${this._start_dragHandler}
       />
    <circle
       style="fill:${this.theme.primaryColor};cursor: move;fill-opacity:1;filter:url(#filter1261);stroke:#ffffff;stroke-miterlimit:4;stroke-dasharray:none"
       id="end-handle"
       cx="calc(100% - 30)"
       cy="60"
       r="${this.handleRadius}"
       @touchstart=${this._drag_ON}
       @touchend=${this._drag_OFF}
       @touchmove=${this._end_dragHandler}/>
  </g>
</svg>
        `;
    }

    _drag_ON= (e:TouchEvent)=>{
     this.isDraging=true;
   }

   _drag_OFF=(e:TouchEvent)=>{
      this.isDraging=false;
   }

   _drag=(e: TouchEvent)=>{
      if(this.isDraging){
        let posX = e.changedTouches[0].clientX;
        let minEx = this.posMin+this.handleRadius;
        let maxEx = this.posMax-this.handleRadius;

        if(posX<minEx){
           posX = minEx;
        }else if(posX>maxEx){
           posX = maxEx;
        }
        return posX;
     }else{
        console.log("no drag on");
     }
   }

   _start_drag=(e:TouchEvent)=>{
      let posX = this._drag(e);
      this.setStartPos(posX!);
   }

   _end_drag=(e:TouchEvent)=>{
      let posX = this._drag(e);
      this.setEndPos(posX!);
   }


   _start_dragHandler ={
      handleEvent: this._start_drag,
      passive: true
   }
   

   _end_dragHandler ={
      handleEvent: this._end_drag,
      passive: true
   }

   valueToPercentage(value:number):number{
      return ((value-(this.min+ this.handleRadius/this.width))/(this.max - this.min- (2*this.handleRadius/this.width)))*100;
   }

   percentageToPosition(percentage:number):number{
      return percentage * (this.posMax-this.posMin-2*this.handleRadius)/100;
   }

   private handleRadius:number;
   private posMax:number=0;
   private posMin:number=0;

    constructor(type: BlocType<F,FormState>){
        super(type);
        let max = this.getAttribute("max");
        let min = this.getAttribute("min");

        this.handleRadius = 30;

        if(!(max && min)){
            throw `Not all attributes provided for a range selector: min and max`;
        }else{
            this.max = Number(max);
            this.min = Number(min);
        }
        
        let isint = this.getAttribute("isint");
        this.isint = isint?true:false;
    }

    private width:number=0;

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
         
         let width =  this.shadowRoot?.querySelector("svg")?.clientWidth;
         let left = this.shadowRoot?.querySelector("svg")?.clientLeft;

         this.posMin = left!;
         this.posMax = width!+ this.posMin;
         this.width = this.posMax-this.posMin;

         console.log(this.start,this.valueToPercentage(this.start!), this.percentageToPosition(this.valueToPercentage(this.start!)) )

         let start_posX = this.percentageToPosition(this.valueToPercentage(this.start!));
         this.setStartPos(start_posX);
    }

    setStartPos(posX:number){
      this.shadowRoot?.querySelector("#start-handle")?.setAttribute("cx",`${posX}`);
    }

    setEndPos(posX:number){
      this.shadowRoot?.querySelector("#end-handle")?.setAttribute("cx",`${posX}`);
    }


}