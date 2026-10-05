"use strict";

function getModelScores() {
    const modelDefinitions = [
        {
            id: "claudeScore",
            name: "Claude"
        },
        {
            id: "geminiScore",
            name: "Gemini"
        },
        {
            id: "chatgptScore",
            name: "ChatGPT"
        },
        {
            id: "copilotScore",
            name: "Copilot"
        }
    ];

    return modelDefinitions
        .map(model => {
            const input =
                document.getElementById(model.id);

            const score =
                input
                    ? Number.parseFloat(input.value)
                    : Number.NaN;

            return {
                model: model.name,
                score
            };
        })
        .filter(item =>
            Number.isFinite(item.score)
        );
}

function detectConflicts() {
    const scores = getModelScores();

    const output =
        document.getElementById(
            "conflictOutput"
        );

    if (scores.length < 2) {
        const message =
            "Konfliktų analizei reikia bent dviejų modelių balų.";

        if (output) {
            output.value = message;
        }

        appState.projectData.conflicts = [];

        return [];
    }

    const threshold =
        Number.isFinite(
            appState.settings.conflictThreshold
        )
            ? appState.settings.conflictThreshold
            : 0.5;

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

            if (difference >= threshold) {
                conflicts.push({
                    id:
                        "conflict-" +
                        Date.now() +
                        "-" +
                        firstIndex +
                        "-" +
                        secondIndex,

                    type: "score-gap",

                    firstModel: first.model,
                    firstScore: first.score,

                    secondModel: second.model,
                    secondScore: second.score,

                    difference:
                        Number(
                            difference.toFixed(2)
                        ),

                    threshold,

                    severity:
                        difference >= 1
                            ? "critical"
                            : difference >= 0.75
                                ? "high"
                                : "medium",

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

    if (!output) {
        return conflicts;
    }

    if (conflicts.length === 0) {
        output.value =
            "Reikšmingų konfliktų neaptikta.\n" +
            "Didžiausias leidžiamas skirtumas: " +
            threshold.toFixed(2);

        return conflicts;
    }

    const lines = [
        "Aptikta konfliktų: " +
            conflicts.length,
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
                "Rizikos lygis: " +
                conflict.severity
            );

            lines.push("");
        }
    );

    output.value = lines.join("\n");

    return conflicts;
}

window.getModelScores = getModelScores;
window.detectConflicts = detectConflicts;
