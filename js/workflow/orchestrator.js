"use strict";

async function executeAvailableFunction(
    functionName,
    ...argumentsList
) {
    const callableFunction =
        window[functionName];

    if (typeof callableFunction !== "function") {
        console.warn(
            "Funkcija neprieinama:",
            functionName
        );

        return null;
    }

    return await Promise.resolve(
        callableFunction(...argumentsList)
    );
}

function validatePipelineInput() {
    updateProjectStateFromForm();

    const task =
        appState.projectData.task.trim();

    const text =
        appState.projectData.text.trim();

    if (!task) {
        return {
            valid: false,
            message:
                "Prieš paleisdami procesą įrašykite užduotį."
        };
    }

    if (!text) {
        return {
            valid: false,
            message:
                "Įrašykite pradinį tekstą arba pirmiausia jį sugeneruokite."
        };
    }

    return {
        valid: true,
        message: ""
    };
}

function readCurrentConsensusResult() {
    const averageElement =
        document.getElementById("averageScore");

    const consensusElement =
        document.getElementById("consensusScore");

    const average =
        Number.parseFloat(
            averageElement
                ? averageElement.textContent
                : "0"
        ) || 0;

    const consensusPercentage =
        Number.parseFloat(
            consensusElement
                ? consensusElement.textContent
                : "0"
        ) || 0;

    const scores = [
        "claudeScore",
        "geminiScore",
        "chatgptScore",
        "copilotScore"
    ]
        .map(id => {
            const element =
                document.getElementById(id);

            return element
                ? Number.parseFloat(element.value)
                : Number.NaN;
        })
        .filter(Number.isFinite);

    const minimum =
        scores.length > 0
            ? Math.min(...scores)
            : 0;

    const maximum =
        scores.length > 0
            ? Math.max(...scores)
            : 0;

    const scoreGap =
        scores.length > 0
            ? maximum - minimum
            : 0;

    const conflicts =
        Array.isArray(
            appState.projectData.conflicts
        )
            ? appState.projectData.conflicts.length
            : 0;

    const approved =
        minimum >=
            appState.settings.targetMinimumScore &&
        average >=
            appState.settings.targetAverageScore &&
        scoreGap <=
            appState.settings.maximumScoreGap &&
        conflicts === 0;

    return {
        approved,
        average,
        minimum,
        maximum,
        scoreGap,
        consensusPercentage,
        conflicts
    };
}

function recordPipelineScore(consensusResult) {
    const score =
        Number.isFinite(consensusResult.average)
            ? consensusResult.average
            : 0;

    appState.pipeline.currentScore = score;
    appState.pipeline.scoreHistory.push(score);

    if (score > appState.pipeline.bestScore) {
        appState.pipeline.bestScore = score;
        appState.pipeline.bestText =
            appState.projectData.text;
    }
}

async function runSinglePipelineIteration() {
    appState.pipeline.iteration += 1;

    setPipelineStage(
        PipelineStage.PREPARING,
        "Ruošiama " +
            appState.pipeline.iteration +
            " iteracija"
    );

    updateProjectStateFromForm();

    setPipelineStage(
        PipelineStage.VALIDATING
    );

    await executeAvailableFunction(
        "generatePrompt"
    );

    await executeAvailableFunction(
        "calculateConsensus"
    );

    setPipelineStage(
        PipelineStage.RESOLVING
    );

    await executeAvailableFunction(
        "detectConflicts"
    );

    await executeAvailableFunction(
        "buildConflictTree"
    );

    setPipelineStage(
        PipelineStage.APPROVING
    );

    await executeAvailableFunction(
        "finalAuthority"
    );

    const consensusResult =
        readCurrentConsensusResult();

    appState.projectData.consensus =
        consensusResult;

    recordPipelineScore(
        consensusResult
    );

    await executeAvailableFunction(
        "saveVersion"
    );

    await executeAvailableFunction(
        "saveProject"
    );

    return consensusResult;
}

async function startPipeline() {
    if (appState.pipeline.running) {
        console.warn(
            "Pipeline jau vykdomas."
        );

        return;
    }

    const inputValidation =
        validatePipelineInput();

    if (!inputValidation.valid) {
        alert(inputValidation.message);
        return;
    }

    resetPipelineState();

    appState.pipeline.running = true;
    appState.pipeline.cancelled = false;
    appState.pipeline.paused = false;

    try {
        let consensusResult = null;

        do {
            if (
                appState.pipeline.cancelled ||
                appState.pipeline.paused
            ) {
                break;
            }

            consensusResult =
                await runSinglePipelineIteration();

            const continuation =
                evaluateLoopContinuation(
                    consensusResult
                );

            if (!continuation.continue) {
                if (
                    continuation.reason ===
                    "approved"
                ) {
                    markPipelineCompleted(
                        continuation.message
                    );
                } else if (
                    continuation.reason !==
                        "paused" &&
                    continuation.reason !==
                        "cancelled"
                ) {
                    appState.pipeline.running =
                        false;

                    setPipelineStage(
                        PipelineStage.COMPLETED,
                        continuation.message
                    );
                }

                break;
            }

            /*
             * Kol nėra automatinio Editor agento,
             * negalima automatiškai pradėti kitos
             * iteracijos su tuo pačiu tekstu.
             */
            if (
                appState.settings.autonomyMode ===
                "manual"
            ) {
                appState.pipeline.running = false;

                setPipelineStage(
                    PipelineStage.PAUSED,
                    "Vertinimas baigtas. Pataisykite tekstą ir tęskite."
                );

                break;
            }

            /*
             * Ateityje čia bus kviečiamas
             * automatinis Editor agentas.
             */
            const editorResult =
                await executeAvailableFunction(
                    "runEditorAgent",
                    consensusResult
                );

            if (!editorResult) {
                appState.pipeline.running = false;

                setPipelineStage(
                    PipelineStage.PAUSED,
                    "Automatinis redaktorius dar neprijungtas."
                );

                break;
            }
        } while (appState.pipeline.running);

    } catch (error) {
        console.error(
            "Pipeline klaida:",
            error
        );

        markPipelineFailed(error);
    }
}
