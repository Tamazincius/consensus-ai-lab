"use strict";

const APP_VERSION = "0.2.0";

const appState = {
    version: APP_VERSION,

    currentProject: null,

    projectData: {
        id: null,
        title: "",
        task: "",
        text: "",
        reviews: [],
        versions: [],
        conflicts: [],
        consensus: null,
        arbitration: "",
        createdAt: null,
        updatedAt: null
    },

    pipeline: {
        stage: "idle",
        iteration: 0,
        running: false,
        paused: false,
        cancelled: false,
        completed: false,
        scoreHistory: [],
        currentScore: 0,
        bestScore: 0,
        bestText: "",
        statusMessage: "Pasirengta",
        error: null
    },

    settings: {
        targetMinimumScore: 9.6,
        targetAverageScore: 9.7,
        maximumScoreGap: 0.3,
        maximumIterations: 10,
        stagnationLimit: 3,
        minimumImprovement: 0.05,
        conflictThreshold: 0.5,
        autonomyMode: "manual"
    }
};

function resetPipelineState() {
    appState.pipeline = {
        stage: "idle",
        iteration: 0,
        running: false,
        paused: false,
        cancelled: false,
        completed: false,
        scoreHistory: [],
        currentScore: 0,
        bestScore: 0,
        bestText: "",
        statusMessage: "Pasirengta",
        error: null
    };
}

function updateProjectStateFromForm() {
    const taskElement = document.getElementById("task");
    const textElement = document.getElementById("text");
    const arbitrationElement =
        document.getElementById("arbitratorNotes");

    appState.projectData.task =
        taskElement ? taskElement.value.trim() : "";

    appState.projectData.text =
        textElement ? textElement.value : "";

    appState.projectData.arbitration =
        arbitrationElement ? arbitrationElement.value : "";

    appState.projectData.updatedAt =
        new Date().toISOString();
}

function updateFormFromProjectState() {
    const taskElement = document.getElementById("task");
    const textElement = document.getElementById("text");
    const arbitrationElement =
        document.getElementById("arbitratorNotes");

    if (taskElement) {
        taskElement.value =
            appState.projectData.task || "";
    }

    if (textElement) {
        textElement.value =
            appState.projectData.text || "";
    }

    if (arbitrationElement) {
        arbitrationElement.value =
            appState.projectData.arbitration || "";
    }
}
