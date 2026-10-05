"use strict";

/*
 * Consensus AI Lab
 * Vietinės projekto būsenos saugojimo modulis.
 *
 * Šis failas:
 * 1. Saugo dabartinio projekto laukus localStorage.
 * 2. Automatiškai išsaugo pakeitimus.
 * 3. Atkuria duomenis atidarius programėlę.
 * 4. Nekeičia versijų istorijos, kurią valdo history.js.
 * 5. Nekeičia projektų sąrašo, kurį valdo projects.js.
 */

const STORAGE_KEY = "consensus-ai-lab-current-project";
const LEGACY_STORAGE_KEY = "consensus-project";
const STORAGE_SCHEMA_VERSION = 1;
const AUTOSAVE_DELAY_MS = 600;

let autosaveTimer = null;
let storageInitialized = false;


/*
 * Saugiai grąžina HTML elementą pagal ID.
 * Jei elemento nėra, grąžinama null ir klaida nekeliama.
 */
function getStorageElement(id) {
    return document.getElementById(id);
}


/*
 * Grąžina elemento reikšmę.
 * Tinka input, textarea ir select elementams.
 */
function getStorageValue(id, fallback = "") {
    const element = getStorageElement(id);

    if (!element) {
        return fallback;
    }

    if ("value" in element) {
        return element.value;
    }

    return element.textContent || fallback;
}


/*
 * Grąžina elemento tekstinę reikšmę.
 * Naudojama rezultatų span elementams.
 */
function getStorageText(id, fallback = "") {
    const element = getStorageElement(id);

    if (!element) {
        return fallback;
    }

    return element.textContent || fallback;
}


/*
 * Saugiai nustato input, textarea arba select reikšmę.
 */
function setStorageValue(id, value) {
    const element = getStorageElement(id);

    if (!element) {
        return;
    }

    if ("value" in element) {
        element.value = value ?? "";
    }
}


/*
 * Saugiai nustato tekstinio elemento turinį.
 */
function setStorageText(id, value) {
    const element = getStorageElement(id);

    if (!element) {
        return;
    }

    element.textContent = value ?? "";
}


/*
 * Sukuria dabartinės ekrano būsenos kopiją.
 *
 * Funkciją gali naudoti:
 * - saveProject();
 * - history.js;
 * - export.js;
 * - orchestrator.js;
 */
function getProjectSnapshot() {
    return {
        schemaVersion: STORAGE_SCHEMA_VERSION,

        metadata: {
            savedAt: new Date().toISOString(),
            application: "Consensus AI Lab"
        },

        project: {
            task: getStorageValue("task"),
            text: getStorageValue("text"),
            promptOutput: getStorageValue("promptOutput")
        },

        reviewerImport: {
            rawResponse: getStorageValue("reviewerImport"),
            importedScore: getStorageText("importedScore", "0")
        },

        scores: {
            claude: getStorageValue("claudeScore"),
            gemini: getStorageValue("geminiScore"),
            chatgpt: getStorageValue("chatgptScore"),
            copilot: getStorageValue("copilotScore")
        },

        results: {
            averageScore: getStorageText("averageScore", "0"),
            consensusScore: getStorageText("consensusScore", "0%"),
            dashboardQuality: getStorageText("dashboardQuality", "0"),
            dashboardConsensus: getStorageText(
                "dashboardConsensus",
                "0%"
            ),
            dashboardStatus: getStorageText(
                "dashboardStatus",
                "DRAFT"
            )
        },

        arbitration: {
            notes: getStorageValue("arbitratorNotes"),
            conflicts: getStorageValue("conflictOutput"),
            conflictTree: getStorageValue("conflictTree"),
            finalAuthority: getStorageValue("finalAuthority")
        },

        workflow: {
            currentStep:
                window.consensusWorkflowState?.currentStep || null,

            currentIteration:
                window.consensusWorkflowState?.currentIteration || 1,

            pendingUserAction:
                window.consensusWorkflowState?.pendingUserAction || null,

            approved:
                window.consensusWorkflowState?.approved || false
        }
    };
}


/*
 * Išsaugo dabartinę projekto būseną.
 *
 * Šią funkciją tiesiogiai kviečia index.html mygtukas:
 * onclick="saveProject()"
 */
function saveProject(options = {}) {
    const showMessage = options.showMessage !== false;

    try {
        const snapshot = getProjectSnapshot();

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(snapshot)
        );

        if (showMessage) {
            showStorageStatus(
                "Projektas išsaugotas šiame įrenginyje.",
                "success"
            );
        }

        return snapshot;
    } catch (error) {
        console.error(
            "Nepavyko išsaugoti projekto:",
            error
        );

        if (showMessage) {
            showStorageStatus(
                "Nepavyko išsaugoti projekto. Patikrinkite naršyklės saugyklos nustatymus.",
                "error"
            );
        }

        return null;
    }
}


/*
 * Atkuria išsaugotą projekto būseną.
 */
function loadProject() {
    try {
        let rawData = localStorage.getItem(STORAGE_KEY);

        /*
         * Suderinamumas su ankstesne duomenų versija.
         */
        if (!rawData) {
            rawData = localStorage.getItem(
                LEGACY_STORAGE_KEY
            );
        }

        if (!rawData) {
            return false;
        }

        const data = JSON.parse(rawData);

        /*
         * Ankstesnės paprastos struktūros atkūrimas.
         */
        if (!data.project && (
            data.task !== undefined ||
            data.text !== undefined
        )) {
            setStorageValue("task", data.task || "");
            setStorageValue("text", data.text || "");
            setStorageValue(
                "arbitratorNotes",
                data.arbitration || ""
            );

            /*
             * Iškart perkeliame seną formatą į naują.
             */
            saveProject({
                showMessage: false
            });

            return true;
        }

        const project = data.project || {};
        const reviewerImport = data.reviewerImport || {};
        const scores = data.scores || {};
        const results = data.results || {};
        const arbitration = data.arbitration || {};

        setStorageValue(
            "task",
            project.task || ""
        );

        setStorageValue(
            "text",
            project.text || ""
        );

        setStorageValue(
            "promptOutput",
            project.promptOutput || ""
        );

        setStorageValue(
            "reviewerImport",
            reviewerImport.rawResponse || ""
        );

        setStorageText(
            "importedScore",
            reviewerImport.importedScore || "0"
        );

        setStorageValue(
            "claudeScore",
            scores.claude || ""
        );

        setStorageValue(
            "geminiScore",
            scores.gemini || ""
        );

        setStorageValue(
            "chatgptScore",
            scores.chatgpt || ""
        );

        setStorageValue(
            "copilotScore",
            scores.copilot || ""
        );

        setStorageText(
            "averageScore",
            results.averageScore || "0"
        );

        setStorageText(
            "consensusScore",
            results.consensusScore || "0%"
        );

        setStorageText(
            "dashboardQuality",
            results.dashboardQuality || "0"
        );

        setStorageText(
            "dashboardConsensus",
            results.dashboardConsensus || "0%"
        );

        setStorageText(
            "dashboardStatus",
            results.dashboardStatus || "DRAFT"
        );

        setStorageValue(
            "arbitratorNotes",
            arbitration.notes || ""
        );

        setStorageValue(
            "conflictOutput",
            arbitration.conflicts || ""
        );

        setStorageValue(
            "conflictTree",
            arbitration.conflictTree || ""
        );

        setStorageValue(
            "finalAuthority",
            arbitration.finalAuthority || ""
        );

        restoreWorkflowState(data.workflow);

        return true;
    } catch (error) {
        console.error(
            "Nepavyko atkurti projekto:",
            error
        );

        showStorageStatus(
            "Išsaugoti projekto duomenys sugadinti arba neatpažįstami.",
            "error"
        );

        return false;
    }
}


/*
 * Atkuria vedlio būseną, jeigu orchestrator modulis jau ją sukūrė.
 */
function restoreWorkflowState(savedWorkflow) {
    if (!savedWorkflow) {
        return;
    }

    if (!window.consensusWorkflowState) {
        return;
    }

    window.consensusWorkflowState.currentStep =
        savedWorkflow.currentStep ||
        window.consensusWorkflowState.currentStep;

    window.consensusWorkflowState.currentIteration =
        Number(savedWorkflow.currentIteration) || 1;

    window.consensusWorkflowState.pendingUserAction =
        savedWorkflow.pendingUserAction || null;

    window.consensusWorkflowState.approved =
        Boolean(savedWorkflow.approved);
}


/*
 * Atideda automatinį išsaugojimą.
 *
 * Taip localStorage neatnaujinama po kiekvieno
 * klavišo paspaudimo.
 */
function scheduleAutosave() {
    clearTimeout(autosaveTimer);

    autosaveTimer = setTimeout(() => {
        saveProject({
            showMessage: false
        });
    }, AUTOSAVE_DELAY_MS);
}


/*
 * Prijungia automatinį išsaugojimą prie esamų laukų.
 */
function initializeAutosave() {
    const fieldIds = [
        "task",
        "text",
        "promptOutput",
        "reviewerImport",
        "claudeScore",
        "geminiScore",
        "chatgptScore",
        "copilotScore",
        "arbitratorNotes",
        "conflictOutput",
        "conflictTree",
        "finalAuthority"
    ];

    fieldIds.forEach(id => {
        const element = getStorageElement(id);

        if (!element) {
            return;
        }

        element.addEventListener(
            "input",
            scheduleAutosave
        );

        element.addEventListener(
            "change",
            scheduleAutosave
        );
    });
}


/*
 * Parodo trumpą saugojimo būsenos pranešimą.
 *
 * Jei index.html nėra elemento storageStatus,
 * pranešimas rodomas konsolėje ir jokios klaidos nekyla.
 */
function showStorageStatus(message, type = "info") {
    const statusElement =
        getStorageElement("storageStatus");

    if (!statusElement) {
        console.log(
            `[Storage: ${type}] ${message}`
        );

        return;
    }

    statusElement.textContent = message;
    statusElement.dataset.status = type;

    clearTimeout(
        showStorageStatus.clearTimer
    );

    showStorageStatus.clearTimer =
        setTimeout(() => {
            statusElement.textContent = "";
            statusElement.dataset.status = "";
        }, 4000);
}


/*
 * Ištrina tik dabartinio projekto darbinę būseną.
 *
 * Versijų istorija ir projektų sąrašas neliečiami.
 */
function clearCurrentProject() {
    const confirmed = window.confirm(
        "Ar tikrai norite išvalyti dabartinio projekto darbinę būseną? Versijų istorija nebus ištrinta."
    );

    if (!confirmed) {
        return false;
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    const valueFieldIds = [
        "task",
        "text",
        "promptOutput",
        "reviewerImport",
        "claudeScore",
        "geminiScore",
        "chatgptScore",
        "copilotScore",
        "arbitratorNotes",
        "conflictOutput",
        "conflictTree",
        "finalAuthority"
    ];

    valueFieldIds.forEach(id => {
        setStorageValue(id, "");
    });

    setStorageText("importedScore", "0");
    setStorageText("averageScore", "0");
    setStorageText("consensusScore", "0%");
    setStorageText("dashboardQuality", "0");
    setStorageText("dashboardConsensus", "0%");
    setStorageText("dashboardStatus", "DRAFT");

    showStorageStatus(
        "Dabartinio projekto darbinė būsena išvalyta.",
        "success"
    );

    return true;
}


/*
 * Inicializuoja saugyklą tik vieną kartą.
 */
function initializeStorage() {
    if (storageInitialized) {
        return;
    }

    storageInitialized = true;

    loadProject();
    initializeAutosave();

    /*
     * Išsaugome būseną prieš uždarant arba
     * paliekant programėlę.
     */
    window.addEventListener(
        "pagehide",
        () => {
            saveProject({
                showMessage: false
            });
        }
    );

    /*
     * iPad Safari gali sustabdyti programėlę,
     * kai ji pereina į foną.
     */
    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.visibilityState === "hidden") {
                saveProject({
                    showMessage: false
                });
            }
        }
    );
}


/*
 * Nenaudojame window.onload = ...,
 * nes tai galėtų perrašyti kitų modulių onload logiką.
 */
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeStorage
    );
} else {
    initializeStorage();
}


/*
 * Viešos funkcijos kitiems esamo projekto moduliams.
 */
window.getProjectSnapshot = getProjectSnapshot;
window.saveProject = saveProject;
window.loadProject = loadProject;
window.clearCurrentProject = clearCurrentProject;
window.scheduleAutosave = scheduleAutosave;
