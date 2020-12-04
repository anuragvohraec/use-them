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
    private start:number;
    private end: number;
    
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
       style="fill:${this.theme.input_bg_color};fill-opacity:0.54902;stroke-width:0.477727;stroke-linejoin:round;stroke-opacity:0.658819"
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
       style="fill:${this.theme.secondaryColor};cursor: move;fill-opacity:1;filter:url(#filter1261);stroke:#ffffff;stroke-miterlimit:4;stroke-dasharray:none"
       id="start-handle"
       cx="calc(0% + 30)"
       cy="60"
       r="30"
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

    constructor(type: BlocType<F,FormState>){
        super(type);
        let max = this.getAttribute("max");
        let min = this.getAttribute("min");
        let start = this.getAttribute("start");
        let end = this.getAttribute("end");
        
        if(!(max && min && start && end)){
            throw `Not all attributes provided for a range selector: min, max, start and end`;
        }else{
            this.max = Number(max);
            this.min = Number(min);
            this.start = Number(start);
            this.end = Number(end);
        }
        
        let isint = this.getAttribute("isint");
        this.isint = isint?true:false;
    }
}