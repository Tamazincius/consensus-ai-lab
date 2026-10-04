export enum PipelineStage {

  CREATION = "creation",

  VALIDATION = "validation",

  RESOLUTION = "resolution",

  IMPROVEMENT = "improvement",

  APPROVAL = "approval"
}

export interface PipelineState {

  projectId:string;

  stage:PipelineStage;

  iteration:number;

  score:number;

  completed:boolean;

}
