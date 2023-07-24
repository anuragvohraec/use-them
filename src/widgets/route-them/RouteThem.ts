import { html, TemplateResult} from 'bloc-them';
import {Bloc, BlocsProvider, BlocBuilder} from 'bloc-them';
import { Compass, PathDirection} from './compass';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {Utils} from '../../utils/utils';
import { UseThemConfiguration } from '../../configs';
import { OverlayPageBloc } from './overlays';
import { FilePickerExternalTriggers } from '../../screens/file-selector';
import { BogusBloc } from '../../utils/blocs';

export interface RouteState{
  url_path: string;
  pathDirection: PathDirection;
  data?: any;
}

export abstract class RouteThemNavigationHookBloc extends Bloc<number>{
  protected _name: string="RouteThemNavigationHookBloc";
  constructor(){
    super(0);
  }
  /**
   * Called when a page pops up.
   * @param save_history 
   * @param context 
   */
  abstract onPopHook(save_history:boolean,context:HTMLElement, state: RouteState):void;
  /**
   * Called when go to page is called
   * @param save_history 
   * @param context 
   */
  abstract onGoToPageHook(save_history:boolean,context:HTMLElement, state: RouteState):void;
}

// export interface RouterConfig{
//   bloc_name:string;
//   save_history:boolean;
// }

export interface PopStateFunction{
  (e: PopStateEvent):any;
  bloc_name:string;
}

export class RouteThemBloc extends Bloc<RouteState>{

  protected _name: string="RouteThemBloc";
  public static INIT_STATE:RouteState = {url_path:"/", pathDirection: { path_params: {}, matched_pattern: "/", parent_matches: [] },data:{}}
  private _compass: Compass = new Compass();
  private _init_path?: string;

  private _navHooks?: RouteThemNavigationHookBloc | undefined;
  private _navHooksBlocSearchedOnce=false;

  public get navHooks(): RouteThemNavigationHookBloc | undefined {
    if(!this._navHooksBlocSearchedOnce && !this._navHooks && this.hostElement){
      this._navHooks = RouteThemNavigationHookBloc.search<RouteThemNavigationHookBloc>("RouteThemNavigationHookBloc",this.hostElement);
      this._navHooksBlocSearchedOnce=true;
    }
    return this._navHooks;
  }

  constructor(private save_history:boolean=false, protected initState: RouteState = RouteThemBloc.INIT_STATE){
    super(initState);
    this._compass.define("/");

    if(this.save_history){
      this._init_path = document.location.pathname;
      if(window.onpopstate){
        const prev_bloc= (window.onpopstate as PopStateFunction).bloc_name;
        throw `An app should have only one router which can control history. Some where in your code <${prev_bloc}> window.onpopstate function is already registered. And you are retrying again this in bloc ${this.name}!`;
      }
      let p = (e: PopStateEvent)=>{
        try{
          let oldState: RouteState = e.state;
          if(!oldState){
            oldState=this.initState;
          }

          //this will pop up any overlay: which listens for OverlayBloc events
          if(this.state.data?.overlay_id){
            this.popOverlayStack(this.state.data.overlay_id);
            delete this.state.data.overlay_id;
          }

          //if the state has a confirmation message on stack than show confirmation message before pop up
          if(this.state?.data?.confirmation_message){
            let c = confirm(this.state?.data?.confirmation_message);
            if(!c){
              let url_path = this.state.url_path;
              history.pushState(this.state,this._convertUrlToPath(url_path),Utils.build_path(window.location.origin,this._init_path!,url_path));
              return;
            }
          }
          let stateForEmit = {...oldState};
          this.emit(stateForEmit);

          return this.navHooks?.onPopHook(this.save_history,this.hostElement, stateForEmit);
        }finally{
          //Vibrate on back button press
          navigator.vibrate(UseThemConfiguration.PRESS_VIB);
        }
        
      };

      window.onpopstate = p;
    }
  }

  define(routePath: string){
    this._compass.define(routePath);
  }

  popOutOfCurrentPage(){
    navigator.vibrate(UseThemConfiguration.PRESS_VIB);
    history.back();
  }

  _convertUrlToPath(url_path:string){
    return url_path.split('/').join('-').toUpperCase().substring(1);
  }
  
  goToPage(url_path: string, data?: any){
    try{
      let r = this._compass.find(url_path);
      if(r){
        let newRouteState: RouteState = {
          url_path: url_path,
          pathDirection: r,
          data,
        };
        this.emit(newRouteState);
        if(this.save_history){
          let t = this._convertUrlToPath(url_path);
          history.pushState(newRouteState,t,Utils.build_path(window.location.origin,this._init_path!,url_path));
        }
        this.navHooks?.onGoToPageHook(this.save_history,this.hostElement,newRouteState);
      }else{
        console.log(`No route exists for path: ${url_path}`);
      }
    }finally{
      navigator.vibrate(UseThemConfiguration.PRESS_VIB);
    }
  }

  pushOverlayStack(overlay_id:string,clearData:boolean=false){
    let url_path = this.state.url_path;
    let newRouteState= this.state;
    if(!newRouteState){
      newRouteState = this.initState;
    }
    if(!newRouteState.data){
      newRouteState.data={};
    }

    if(clearData){
      newRouteState.data={};
    }

    newRouteState.data.overlay_id=overlay_id;

    let t = this._convertUrlToPath(url_path);
    history.pushState(newRouteState,t,Utils.build_path(window.location.origin,this._init_path!,url_path));
    this.emit(newRouteState);
  }

  private popOverlayStack(overlay_id:string){
    OverlayPageBloc.search<OverlayPageBloc>("OverlayPageBloc",this.hostElement)?.hide(overlay_id);
    if(this.state?.data?.overlay_id){
      delete this.state.data.overlay_id;
    }
  }

  _goToPageDoNotSaveHistory(url_path: string,data?: any){
    let r = this._compass.find(url_path);
    if(r){
      let newRouteState: RouteState = {
        url_path: url_path,
        pathDirection: r,
        data,
      };
      this.emit(newRouteState);
    }else{
      console.log(`No route exists for path: ${url_path}`);
    }
  }

  
  public get savesToHistory() : boolean {
    return this.save_history;
  }
  

}

export class RouteThemController extends BlocsProvider{
  constructor(){
    super({RouteThemBloc: new RouteThemBloc()})
  }

  builder(): TemplateResult {
    return html`<div style="width:100%;height:100%;"><slot></slot></div>`;
  }
}


/**
 * At first this may seems redundant, but its required to encapsulate pages.
 * Without this man content will be visible uncontrollably.
 */
export class RouteThem extends BlocBuilder<BogusBloc,number>{
  constructor(private pageTagName: string = "a-page", private routeBlocName: string="RouteThemBloc"){
    super("BogusBloc", {
      blocs_map:{
          BogusBloc: new BogusBloc()
      }
    });
  }
  
  connectedCallback(){
    super.connectedCallback();
    let routeBloc = RouteThemBloc.search<RouteThemBloc>(this.routeBlocName,this);
    
    this.querySelectorAll(this.pageTagName).forEach(e=>{
      let r = e.getAttribute("route");
      if(!r){
        throw `No route defined for a page`;
      }
      routeBloc?.define(r);
    });

    if(routeBloc?.savesToHistory){
      const hash = window.location.hash;
      if(hash){
        routeBloc?._goToPageDoNotSaveHistory("/"+hash,history?.state?.data);
      }
    }
  }

  builder(state: number): TemplateResult {
    return html`<div style="width:100%;height:100%;"><slot></slot></div>`;
  }
}


export class APage extends BlocBuilder<RouteThemBloc, RouteState>{
  private initInnerHTML:string;
  private behavior:"hide"|"reload"="hide";
  
  constructor(blocName:string="RouteThemBloc"){
    super(blocName)
    this.initInnerHTML=this.innerHTML;
    let r = this.getAttribute("behaves");
    if(r){
      r = r.toLowerCase();
      //@ts-ignore
      this.behavior=r;
    }
  }

  public get route() : string {
    let r = this.getAttribute("route");
    if(!r){
      throw `No route defined for a page`;
    }else{
      return r;
    } 
  }

  public toBeHidden(state: RouteState):boolean{
    if(state.pathDirection.matched_pattern === this.route){
      return false;
    }else{
      return true;
    }
  }

  builder(state: RouteState): TemplateResult {
    let doHide:boolean = this.toBeHidden(state);

    switch(this.behavior){
      case "hide":
        return this._getBaseTemplate(doHide);
      case "reload":
        return html`${doHide?html`<div></div>`: this._getHtmlWithInnerContent()}`;
      default:
        return this._getBaseTemplate(doHide);
    }
  }

  protected _getHtmlWithInnerContent():TemplateResult{
    this.innerHTML='';
    const t = html`<div style="width:100%;height:100%;">
    ${unsafeHTML(this.initInnerHTML)}
    </div>`;
    return t;
  }

  protected _getBaseTemplate(doHide: boolean): TemplateResult{
    return html`
    <style>
      .hide{
        display: none;
      }
      .show{
        display: block;
      }
    </style>
    <div class="${doHide?'hide':'show'}" style="width:100%;height:100%;">
    <slot></slot>
    </div>
    `;
  }

}

customElements.get("route-them-controller")||customElements.define("route-them-controller", RouteThemController);
customElements.get("route-them")||customElements.define('route-them', RouteThem);
customElements.get("a-page")||customElements.define("a-page", APage);


export class AppPageBloc extends RouteThemBloc{
  protected _name: string="AppPageBloc";
  constructor(){
    super(true);
  }
}

export class AppPageController extends BlocsProvider{
  constructor(){
    super({
      AppPageBloc: new AppPageBloc(),
      OverlayPageBloc: new OverlayPageBloc(),
      FilePickerExternalTriggers: new FilePickerExternalTriggers()
    })
  }

  builder(): TemplateResult {
    return html`<div style="width:100%;height:100%;"><slot></slot></div>`;
  }
}
customElements.get("app-pages-controller")||customElements.define("app-pages-controller",AppPageController);

export class AppPage extends APage{
  constructor(){
    super("AppPageBloc")
  }
}
customElements.get("app-page")||customElements.define("app-page",AppPage);

export class AppPageContainer extends RouteThem{
  constructor(){
    super("app-page","AppPageBloc");
  }
}
customElements.get("app-pages-container")||customElements.define("app-pages-container",AppPageContainer);