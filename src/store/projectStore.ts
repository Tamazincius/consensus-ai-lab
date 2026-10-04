import { create }
from "zustand";

import {
 PipelineState
}
from "../orchestrator/pipeline";

interface ProjectStore {

 pipeline:
 PipelineState | null;

 setPipeline:
 (pipeline:PipelineState)
 => void;
}

export const useProjectStore =
create<ProjectStore>(
 (set)=>({

  pipeline:null,

  setPipeline:
   (pipeline)=>
    set({pipeline})

 })
);
