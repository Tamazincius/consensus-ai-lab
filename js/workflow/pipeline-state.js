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

    appState.pipeline.stage = stage;

    appState.pipeline.statusMessage =
        message ||
        PIPELINE_STAGE_LABELS[stage] ||
        stage;

    renderPipelineStatus();
}

function renderPipelineStatus() {
    const statusElement =
        document.getElementById("dashboardStatus");

    if (statusElement) {
        statusElement.textContent =
            appState.pipeline.statusMessage;
    }

    document.body.dataset.pipelineStage =
        appState.pipeline.stage;
}

function markPipelineFailed(error) {
    appState.pipeline.running = false;
    appState.pipeline.completed = false;
    appState.pipeline.error =
        error instanceof Error
            ? error.message
            : String(error);

    setPipelineStage(
        PipelineStage.FAILED,
        "Klaida: " + appState.pipeline.error
    );
}

function markPipelineCompleted(message) {
    appState.pipeline.running = false;
    appState.pipeline.paused = false;
    appState.pipeline.completed = true;

    setPipelineStage(
        PipelineStage.COMPLETED,
        message || "Procesas sėkmingai baigtas"
    );
}

function pausePipeline() {
    if (!appState.pipeline.running) {
        return;
    }

    appState.pipeline.paused = true;

    setPipelineStage(
        PipelineStage.PAUSED,
        "Procesas pristabdytas"
    );
}

function resumePipeline() {
    if (!appState.pipeline.paused) {
        return;
    }

    appState.pipeline.paused = false;

    setPipelineStage(
        PipelineStage.PREPARING,
        "Procesas tęsiamas"
    );
}

function cancelPipeline() {
    appState.pipeline.cancelled = true;
    appState.pipeline.running = false;
    appState.pipeline.paused = false;

    setPipelineStage(
        PipelineStage.CANCELLED,
        "Procesas nutrauktas"
    );
}
