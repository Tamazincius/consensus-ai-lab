"use strict";

const PipelineStage = Object.freeze({
    IDLE: "idle",
    PREPARING: "preparing",
    PLANNING: "planning",
    DRAFTING: "drafting",
    VALIDATING: "validating",
    META_REVIEW: "meta-review",
    RESOLVING: "resolving",
    RED_TEAM: "red-team",
    IMPROVING: "improving",
    REVALIDATING: "revalidating",
    APPROVING: "approving",
    COMPLETED: "completed",
    PAUSED: "paused",
    FAILED: "failed",
    CANCELLED: "cancelled"
});

const PIPELINE_STAGE_LABELS = Object.freeze({
    idle: "Pasirengta",
    preparing: "Ruošiama",
    planning: "Kuriamas planas",
    drafting: "Kuriamas tekstas",
    validating: "Atliekamas vertinimas",
    "meta-review": "Tikrinami vertinimai",
    resolving: "Sprendžiami konfliktai",
    "red-team": "Atliekama Red Team analizė",
    improving: "Tekstas tobulinamas",
    revalidating: "Atliekamas pakartotinis vertinimas",
    approving: "Priimamas galutinis sprendimas",
    completed: "Procesas baigtas",
    paused: "Procesas pristabdytas",
    failed: "Proceso klaida",
    cancelled: "Procesas nutrauktas"
});

function setPipelineStage(stage, message) {
    if (!Object.values(PipelineStage).includes(stage)) {
        throw new Error(
            "Nežinomas pipeline etapas: " + stage
        );
    }

    if (
        typeof appState === "undefined" ||
        !appState.pipeline
    ) {
        throw new Error(
            "Pipeline būsena neinicijuota. " +
            "Patikrinkite, ar state.js įkeliamas prieš pipeline-state.js."
        );
    }

    appState.pipeline.stage = stage;

    appState.pipeline.statusMessage =
        message ||
        PIPELINE_STAGE_LABELS[stage] ||
        stage;

    renderPipelineStatus();

    return appState.pipeline.stage;
}

function renderPipelineStatus() {
    const statusElement =
        document.getElementById(
            "dashboardStatus"
        );

    if (statusElement) {
        statusElement.textContent =
            appState.pipeline.statusMessage;
    }

    if (document.body) {
        document.body.dataset.pipelineStage =
            appState.pipeline.stage;

        document.body.dataset.pipelineRunning =
            String(
                appState.pipeline.running
            );
    }
}

function markPipelineFailed(error) {
    appState.pipeline.running = false;
    appState.pipeline.paused = false;
    appState.pipeline.cancelled = false;
    appState.pipeline.completed = false;

    appState.pipeline.error =
        error instanceof Error
            ? error.message
            : String(error);

    setPipelineStage(
        PipelineStage.FAILED,
        "Klaida: " +
            appState.pipeline.error
    );
}

function markPipelineCompleted(message) {
    appState.pipeline.running = false;
    appState.pipeline.paused = false;
    appState.pipeline.cancelled = false;
    appState.pipeline.completed = true;
    appState.pipeline.error = null;

    setPipelineStage(
        PipelineStage.COMPLETED,
        message ||
            "Procesas sėkmingai baigtas"
    );
}

function pausePipeline(message) {
    if (
        !appState.pipeline.running &&
        !appState.pipeline.paused
    ) {
        return false;
    }

    appState.pipeline.running = false;
    appState.pipeline.paused = true;
    appState.pipeline.completed = false;

    setPipelineStage(
        PipelineStage.PAUSED,
        message ||
            "Procesas pristabdytas"
    );

    return true;
}

function resumePipeline() {
    if (!appState.pipeline.paused) {
        return false;
    }

    appState.pipeline.paused = false;
    appState.pipeline.cancelled = false;
    appState.pipeline.running = true;
    appState.pipeline.completed = false;
    appState.pipeline.error = null;

    setPipelineStage(
        PipelineStage.PREPARING,
        "Procesas tęsiamas"
    );

    return true;
}

function cancelPipeline() {
    appState.pipeline.cancelled = true;
    appState.pipeline.running = false;
    appState.pipeline.paused = false;
    appState.pipeline.completed = false;

    setPipelineStage(
        PipelineStage.CANCELLED,
        "Procesas nutrauktas"
    );
}

function resetPipelineStatus() {
    appState.pipeline.stage =
        PipelineStage.IDLE;

    appState.pipeline.running = false;
    appState.pipeline.paused = false;
    appState.pipeline.cancelled = false;
    appState.pipeline.completed = false;
    appState.pipeline.error = null;
    appState.pipeline.statusMessage =
        PIPELINE_STAGE_LABELS.idle;

    renderPipelineStatus();
}

/*
 * Aiškiai paskelbiame viešą sąsają.
 *
 * Tai leidžia kitiems klasikiniams JavaScript
 * failams ir HTML onclick atributams patikimai
 * pasiekti šias reikšmes bei funkcijas.
 */
window.PipelineStage =
    PipelineStage;

window.PIPELINE_STAGE_LABELS =
    PIPELINE_STAGE_LABELS;

window.setPipelineStage =
    setPipelineStage;

window.renderPipelineStatus =
    renderPipelineStatus;

window.markPipelineFailed =
    markPipelineFailed;

window.markPipelineCompleted =
    markPipelineCompleted;

window.pausePipeline =
    pausePipeline;

window.resumePipeline =
    resumePipeline;

window.cancelPipeline =
    cancelPipeline;

window.resetPipelineStatus =
    resetPipelineStatus;
