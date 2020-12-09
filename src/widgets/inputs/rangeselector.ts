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
    private value:Range={start:0 , end:0}

    private isDraging: boolean=false;

    
    
    builder(state: FormState): TemplateResult {
       let isDisabled = this.disabled;
       if(isDisabled){
          this.start_color = this.base_color;
          this.end_color = this.base_color;
       }else{
            this.start_color = this.theme.primaryColor;
            this.end_color = this.theme.secondaryColor;
       }
        return html`
        <style>
           .no-select{
            user-select: none;
           }
        </style>
      <lay-them in="row" ma="center">
         <div class="no-select" style="font-weight: bold;  font-size: ${this.theme.H3_font_size};">${this.isint?this.value.start:this.value.start.toFixed(2)}</div>
      </lay-them>
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
         style="stop-color:${this.end_color};stop-opacity:1"
         offset="0"
         id="stop1193" />
      <stop
         style="stop-color:${this.start_color};stop-opacity:1"
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
       style="fill:${this.base_color};stroke-width:0.477727;stroke-linejoin:round;stroke-opacity:0.658819"
       id="base"
       width="100%"
       height="15"
       x="0"
       y="50" />
    <!-- <rect
       style="fill:url(#linearGradient1199);fill-opacity:1;stroke-width:0.477727;stroke-linejoin:round;stroke-opacity:0.658819"
       id="active-range"
       width="100%"
       height="15"
       x="0"
       y="50" /> -->
       <path
       id="acrange"
       style="fill:url(#linearGradient1199);"
       d=""
       id="path833" />
    <circle
       style="fill:${this.end_color};stroke:#ffffff;stroke-width: 4;"
       id="start-handle"
       cy="60"
       r="${this.handleRadius}"
       @touchstart=${this._drag_ON}
       @touchend=${this._drag_OFF}
       @touchmove=${this._start_dragHandler}
       />
    <circle
       style="fill:${this.start_color};stroke:#ffffff;stroke-width: 4;"
       id="end-handle"
       cy="60"
       r="${this.handleRadius}"
       @touchstart=${this._drag_ON}
       @touchend=${this._drag_OFF}
       @touchmove=${this._end_dragHandler}/>
  </g>
</svg>
<lay-them in="row" ma="space-between">
   <div class="no-select"><ut-p>${this.min}</ut-p></div>
   <div class="no-select" style="font-weight: bold;  font-size: ${this.theme.H3_font_size};">${this.isint?this.value.end:this.value.end.toFixed(2)}</div>
   <div class="no-select"><ut-p>${this.max}</ut-p></div>
</lay-them>
        `;
    }

    _drag_ON= (e:TouchEvent)=>{
     this.isDraging=true;
   }

   _drag_OFF=(e:TouchEvent)=>{
      this.isDraging=false;
   }

   _drag=(posX:number)=>{
      if(this.isDraging){
        //let posX = e.changedTouches[0].clientX;
        let minEx = this.posMin+this.handleRadius;
        let maxEx = this.posMax-this.handleRadius;

        if(posX<minEx){
           posX = minEx;
        }else if(posX>maxEx){
           posX = maxEx;
        }
     }else{
        console.log("no drag on");
     }
     return posX;
   }

   _start_drag=(e:TouchEvent)=>{
      if(!this.disabled){
         let posX = e.changedTouches[0].clientX;
         posX = this._drag(posX);
         if(posX! > this.posEnd){
            posX = this.posEnd - 2*this.handleRadius;
         }
         let t = this.posMax-3* this.handleRadius;
         if(posX >= t){
            posX = t;
         }
         this.setStartPos(posX!);
         this.setActiveStart(posX!);
         
         this._postChange();
      }
   }

   _end_drag=(e:TouchEvent)=>{
      if(!this.disabled){
         let posX = e.changedTouches[0].clientX;
         posX = this._drag(posX);
         if(posX!<this.posStart){
            posX = this.posStart + 2*this.handleRadius;
         }
         let t = this.posMin + 3* this.handleRadius;
         if(posX <= t){
            posX = t;
         }
         this.setEndPos(posX!);
         this.setActiveEnd(posX!);
         
         this._postChange();
      }
   }

   _postChange(){
      let en =  this.positionToValue(this.posEnd);
      let st = this.positionToValue(this.posStart);
      if(this.isint){
         en = Math.floor(en);
         st = Math.floor(st);
      }
      this.value = {start: st, end:en};
      this.onChange!(this.value);
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
      return this.handleRadius+percentage * (this.posMax-this.posMin-2*this.handleRadius)/100;
   }

   positionToValue(posX:number){
      return this.min + ((this.max-this.min)/(this.width-2*this.handleRadius))*(posX-this.handleRadius);
   }

   private handleRadius:number;
   private posMax:number=0;
   private posMin:number=0;
   private posStart:number =0;
   private posEnd:number=0;

   private start_color: string;
   private end_color: string;
   private base_color: string;

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

        this.start_color = this.theme.primaryColor;
        this.end_color = this.theme.secondaryColor;
        this.base_color = this.theme.input_bg_color;
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
   
           if(this.start!<this.min){
              throw `Start ${this.start} cannot be less than min value ${this.min}, check form init values for this range selector`;
           }
           
           if(this.end!>this.max){
              throw `End ${this.end} cannot be more than max value ${this.max}, check form init values for this range selector`;
           }
   
           let width =  this.shadowRoot?.querySelector("#svg8")?.clientWidth;
           let left = this.shadowRoot?.querySelector("#svg8")?.clientLeft;
           
           this.posMin = left!;
           this.posMax = width!+ this.posMin;
           this.width = this.posMax-this.posMin;
   
           let start_posX = this.percentageToPosition(this.valueToPercentage(this.start!));
           this.setStartPos(start_posX);
   
           let end_posX = this.percentageToPosition(this.valueToPercentage(this.end!));
           this.setEndPos(end_posX);
   
           
           this.value = {start: this.start!, end: this.end!};
           this.bloc?.emit({...this.bloc.state})
           this.setActiveStart(start_posX);
    }

    setStartPos(posX:number){
      this.shadowRoot?.querySelector("#start-handle")?.setAttribute("cx",`${posX}`);
      this.posStart=posX;
    }

    setActiveStart(posX:number){
      let s = this.posEnd-this.posStart;
      let d=`m ${posX},50 h ${s} v 15 h -${s} z`;
      this.shadowRoot?.querySelector("#acrange")?.setAttribute("d",d);
    }

    setActiveEnd(posX:number){
       let s = this.posStart-this.posMin;
      let d=`m ${s},50 h ${posX-s} v 15 h ${s-posX} z`;
      this.shadowRoot?.querySelector("#acrange")?.setAttribute("d",d);
    }

    setEndPos(posX:number){
      this.shadowRoot?.querySelector("#end-handle")?.setAttribute("cx",`${posX}`);
      this.posEnd = posX;
    }
}