import { Bloc } from "bloc-them";
import { html, TemplateResult } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { WidgetBuilder } from "../utils/blocs";


export enum StepStatus{
    INCOMPLETE="INCOMPLETE",
    COMPLETE="COMPLETE",
    ERROR="ERROR",
    IN_PROGRESS="IN_PROGRESS"
}

export interface Step{
    name:string;
    status: StepStatus;
}

export abstract class StepperBloc extends Bloc<Step[]>{

    constructor(protected steps:Step[]){
        super(steps);
        this._currentStep=steps[0];
    }

    private _currentStep?: Step;
    public get currentStep(): Step {
        return this._currentStep!;
    }

    goToStep(stepName:string){
        if(this._currentStep && this.state){
            const findStep = this.state.find(e=>e.name===stepName);
            if(findStep){
                this.stepChanged(this._currentStep,findStep);
                this._currentStep=findStep;
                this.emit([...this.state]);
            }
        }
    }

    changeStepStatus(stepName:string,newStatus:StepStatus){
        if(this._currentStep && this.state){
            const i = this.state.findIndex(e=>e.name===stepName);
            if(i>-1){
                const t = this.state[i];
                t.status=newStatus;
                this.state[i]={...t};
                this.emit([...this.state]);
            }
        }
    }

    abstract stepChanged(prevStep:Step,newStep:Step):any;

    abstract stepBuilder(step:Step):TemplateResult;
}

class StepperWidget extends WidgetBuilder<StepperBloc,Step[]>{
    private colorMapWithStepStatus:Record<string,string>;

    constructor(){
        super("StepperBloc")
        this.colorMapWithStepStatus={};

        this.colorMapWithStepStatus[StepStatus.INCOMPLETE]="grey";
        this.colorMapWithStepStatus[StepStatus.COMPLETE]="green";
        this.colorMapWithStepStatus[StepStatus.ERROR]="red";
        this.colorMapWithStepStatus[StepStatus.IN_PROGRESS]="amber"; 
    }

    goToStep=(e:Event)=>{
        let t =e.currentTarget as HTMLElement & {n:string};
        const name = t.n;
        this.bloc?.goToStep(name); 
    }

    builder(state: Step[]): TemplateResult {
        return html`
            <style>
            .header{
                height: 35px;
                padding: 0px 10px;
            }
            .body{
                width: 100%;
                flex-grow:1;
                height: 0;
                overflow: auto;
            }
            .body::-webkit-scrollbar { 
                display: none;
            }
            .counter{
                color: #fff;
                padding: 6px;
                font-size: 0.78em;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                font-weight: bold;
                border: 1px solid #fff;
            }
            .title{
                font-size: 0.9em;
                padding: 0px 5px;
                white-space: nowrap;
            }
            .header_item{
                padding: 0px 10px;
                height: 100%;
            }
            </style>
            <lay-them in="column" ma="flex-start" ca="stretch">
                <div class="header">
                    <lay-them in="row" ma="flex-start">
                        ${repeat(state,e=>e.name+e.status,(e,i)=>{
                            return html`
                            <ink-well .n=${e.name} @click=${this.goToStep}>
                                <div class="header_item">
                                
                                    <lay-them in="row" ma="center" ca="center">
                                        <div class="counter" style=${"background-color:"+(this.bloc!.currentStep.name===e.name?"black":this.colorMapWithStepStatus[e.status])}>${i+1}</div>
                                        <div class="title" style=${"color:"+ (this.bloc!.currentStep.name===e.name?"black":this.colorMapWithStepStatus[e.status])}>${e.name}</div>
                                    </lay-them>
                                
                                </div>
                            </ink-well>`;
                        })}
                    </lay-them>
                </div>

                <div class="body">
                    ${this.bloc?.stepBuilder(this.bloc.currentStep)}
                </div>
            </lay-them>
            `;
    }

}
customElements.define("ut-stepper",StepperWidget);