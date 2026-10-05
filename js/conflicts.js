"use strict";

/*
 * Consensus AI Lab
 * Modelių balų konfliktų analizės modulis.
 *
 * Šis failas:
 * 1. Perskaito Claude, Gemini, ChatGPT ir Copilot balus.
 * 2. Patikrina, ar pateikti visi keturi balai.
 * 3. Patikrina, ar balai yra nuo 0 iki 10.
 * 4. Aptinka modelių poras, kurių balų skirtumas
 *    viršija leidžiamą ribą.
 * 5. Išsaugo konfliktus appState.projectData.
 *
 * Semantiniai konfliktai, tokie kaip faktiniai,
 * objektyvūs ar subjektyvūs nesutarimai, bus
 * nustatomi iš modelių JSON atsakymų ir Copilot
 * arbitražo rezultatų.
 */

const CONFLICT_MODEL_DEFINITIONS = Object.freeze([
    {
        id: "claudeScore",
        key: "claude",
        name: "Claude"
    },
    {
        id: "geminiScore",
        key: "gemini",
        name: "Gemini"
    },
    {
        id: "chatgptScore",
        key: "chatgpt",
        name: "ChatGPT"
    },
    {
        id: "copilotScore",
        key: "copilot",
        name: "Copilot"
    }
]);


/*
 * Perskaito visų keturių modelių balų laukus.
 *
 * Neteisingos arba tuščios reikšmės nepašalinamos,
 * nes jos reikalingos validavimo pranešimams.
 */
function getModelScores() {
    return CONFLICT_MODEL_DEFINITIONS.map(model => {
        const input =
            document.getElementById(model.id);

        const rawValue =
            input ? input.value.trim() : "";

        const score =
            rawValue === ""
                ? Number.NaN
                : Number.parseFloat(rawValue);

        return {
            model: model.name,
            key: model.key,
            elementId: model.id,
            rawValue,
            score,
            valid:
                Number.isFinite(score) &&
                score >= 0 &&
                score <= 10
        };
    });
}


/*
 * Patikrina visų modelių balus.
 */
function validateConflictScores(scores) {
    const missingModels = [];
    const invalidModels = [];

    scores.forEach(item => {
        if (item.rawValue === "") {
            missingModels.push(item.model);
            return;
        }

        if (!item.valid) {
            invalidModels.push(item.model);
        }
    });

    if (missingModels.length > 0) {
        return {
            valid: false,
            type: "MISSING_SCORES",
            message:
                "Konfliktų analizei trūksta šių modelių balų:\n- " +
                missingModels.join("\n- ")
        };
    }

    if (invalidModels.length > 0) {
        return {
            valid: false,
            type: "INVALID_SCORES",
            message:
                "Šių modelių balai turi būti skaičiai nuo 0 iki 10:\n- " +
                invalidModels.join("\n- ")
        };
    }

    return {
        valid: true,
        type: null,
        message: ""
    };
}


/*
 * Grąžina patvirtintą didžiausią leidžiamą
 * balų skirtumą.
 */
function getMaximumAllowedScoreGap() {
    const configuredGap =
        Number(
            appState?.settings?.maximumScoreGap
        );

    if (
        Number.isFinite(configuredGap) &&
        configuredGap >= 0
    ) {
        return configuredGap;
    }

    /*
     * Atsarginė reikšmė pagal patvirtintą
     * projekto reikalavimą.
     */
    return 0.2;
}


/*
 * Nustato konflikto rizikos lygį.
 */
function calculateConflictSeverity(difference) {
    if (difference >= 1) {
        return "critical";
    }

    if (difference >= 0.75) {
        return "high";
    }

    if (difference >= 0.4) {
        return "medium";
    }

    return "low";
}


/*
 * Sugeneruoja stabilų konflikto identifikatorių.
 */
function createConflictId(
    firstModel,
    secondModel,
    firstIndex,
    secondIndex
) {
    return [
        "score-gap",
        firstModel.toLowerCase(),
        secondModel.toLowerCase(),
        firstIndex,
        secondIndex
    ].join("-");
}


/*
 * Aptinka balų skirtumų konfliktus.
 */
function detectConflicts() {
    const scores = getModelScores();

    const output =
        document.getElementById(
            "conflictOutput"
        );

    const validation =
        validateConflictScores(scores);

    if (!validation.valid) {
        if (output) {
            output.value = validation.message;
        }

        appState.projectData.conflicts = [];

        appState.projectData.updatedAt =
            new Date().toISOString();

        return [];
    }

    const threshold =
        getMaximumAllowedScoreGap();

    const conflicts = [];

    for (
        let firstIndex = 0;
        firstIndex < scores.length;
        firstIndex += 1
    ) {
        for (
            let secondIndex = firstIndex + 1;
            secondIndex < scores.length;
            secondIndex += 1
        ) {
            const first = scores[firstIndex];
            const second = scores[secondIndex];

            const difference =
                Math.abs(
                    first.score - second.score
                );

            /*
             * Skirtumas lygus leidžiamai ribai
             * nėra konfliktas.
             *
             * Pavyzdžiui:
             * 9.6 ir 9.8, kai riba 0.2,
             * atitinka griežtą konsensuso taisyklę.
             */
            if (difference > threshold) {
                conflicts.push({
                    id: createConflictId(
                        first.model,
                        second.model,
                        firstIndex,
                        secondIndex
                    ),

                    type: "SCORE_GAP_CONFLICT",
                    category: "MODEL_SCORE_DIFFERENCE",

                    firstModel: first.model,
                    firstModelKey: first.key,
                    firstScore: first.score,

                    secondModel: second.model,
                    secondModelKey: second.key,
                    secondScore: second.score,

                    difference:
                        Number(
                            difference.toFixed(2)
                        ),

                    threshold,

                    severity:
                        calculateConflictSeverity(
                            difference
                        ),

                    objective: false,
                    requiresArbitration: true,
                    resolved: false,
                    resolution: ""
                });
            }
        }
    }

    appState.projectData.conflicts =
        conflicts;

    appState.projectData.updatedAt =
        new Date().toISOString();

    /*
     * Jei vedlio būsena prieinama,
     * perduodame preliminarius balų konfliktus.
     */
    if (
        typeof window.setPipelineConflicts ===
        "function"
    ) {
        window.setPipelineConflicts({
            scoreGaps: conflicts
        });
    }

    if (!output) {
        return conflicts;
    }

    if (conflicts.length === 0) {
        output.value =
            "Reikšmingų balų konfliktų neaptikta.\n" +
            "Didžiausias leidžiamas skirtumas: " +
            threshold.toFixed(2);

        return conflicts;
    }

    const lines = [
        "Aptikta balų konfliktų: " +
            conflicts.length,
        "",
        "Leidžiamas didžiausias skirtumas: " +
            threshold.toFixed(2),
        ""
    ];

    conflicts.forEach(
        (conflict, index) => {
            lines.push(
                (index + 1) + ". " +
                conflict.firstModel +
                " (" +
                conflict.firstScore.toFixed(2) +
                ") ir " +
                conflict.secondModel +
                " (" +
                conflict.secondScore.toFixed(2) +
                ")"
            );

            lines.push(
                "Skirtumas: " +
                conflict.difference.toFixed(2)
            );

            lines.push(
                "Konflikto tipas: " +
                conflict.type
            );

            lines.push(
                "Rizikos lygis: " +
                conflict.severity
            );

            lines.push(
                "Rekomendacija: perduoti Copilot arbitražui."
            );

            lines.push("");
        }
    );

    output.value =
        lines.join("\n").trim();

    return conflicts;
}


window.CONFLICT_MODEL_DEFINITIONS =
    CONFLICT_MODEL_DEFINITIONS;

window.getModelScores =
    getModelScores;

window.validateConflictScores =
    validateConflictScores;

window.getMaximumAllowedScoreGap =
    getMaximumAllowedScoreGap;

window.detectConflicts =
    detectConflicts;
