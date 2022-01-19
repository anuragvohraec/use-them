import {BlocBuilder, Bloc} from 'bloc-them';
import { TemplateResult, html } from 'lit-html';

class LayThemBloc extends Bloc<any>{
  protected _name: string="LayThemBloc";
  constructor(){
    super(undefined);
  }
}

export class LayThem extends BlocBuilder<LayThemBloc, any> {
  private lay_them_in:string;
  private main_axis_alignment: string;
  private cross_axis_alignment: string;
  private overflow:string;
  private _wrap:string;

  constructor(){
    super("LayThemBloc", {
      useThisBloc: new LayThemBloc()
    });
    let _in  = this.getAttribute("in");
    if(_in){
      _in = _in.toLowerCase();
    }else{
      _in = "column";
    }

    this.lay_them_in=_in;
    

    let ma = this.getAttribute("ma");
    if(ma){
      ma = ma.toLowerCase();
    }else{
      ma ="center";
    }

    this.main_axis_alignment = ma;

    let ca = this.getAttribute("ca");
    if(ca){
      ca = ca.toLowerCase();
    }else{
      if(_in === "stack"){
        ca = "center";
      }else{
        ca ="stretch";
      }
    }
    this.cross_axis_alignment = ca;
    
    this.overflow="auto";
    let ov = this.getAttribute("overflow");
    if(ov){
      this.overflow=ov;
    }

    let wrap = this.getAttribute("wrap");
    if(wrap){
      this._wrap=wrap.toLowerCase();
    }else{
      this._wrap="nowrap";
    }
  }

  builder(state: any): TemplateResult {
    return html`
    <style>
      .container{
          width: 100%;
          height: 100%;
        overflow: ${this.overflow};
      }
      .flex{
          display: flex;
          flex-wrap: nowrap;
          height: 100%;
          flex-direction: ${(()=>{
            if(this.lay_them_in == "stack"){
              return "column";
            }else{
              return this.lay_them_in;
            }
          })()};
          justify-content: ${this.main_axis_alignment};
          align-items: ${this.cross_axis_alignment};
          flex-wrap: ${this._wrap};
          height: 100%;
          position: ${(()=>{
            if(this.lay_them_in == "stack"){
              return "relative";
            }else{
              return "static";
            }
          })()};
      }
      .container::-webkit-scrollbar {
        display: none;
      }
      
      ${(()=>{
        if(this.lay_them_in == "stack"){
          return "::slotted(div){position: absolute;}";
        }else{
          return "";
        }
        
      })()}
    </style>
    <div class="container">
      <div class="flex" id="flex">
          <slot></slot>
      </div>
    </div>`;
  }
}

window.customElements.define('lay-them', LayThem);