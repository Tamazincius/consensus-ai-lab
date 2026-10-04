"use strict";

async function runConsensusCycle() {
    return startPipeline();
}

function continueConsensusCycle() {
    if (
        appState.pipeline.stage !==
        PipelineStage.PAUSED
    ) {
        return;
    }

    appState.pipeline.paused = false;
    appState.pipeline.running = false;

    return startPipeline();
}
