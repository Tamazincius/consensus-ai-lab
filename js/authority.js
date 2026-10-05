"use strict";

function readNumericElementValue(id) {
    const element =
        document.getElementById(id);

    if (!element) {
        return 0;
    }

    const rawValue =
        "value" in element
            ? element.value
            : element.textContent;

    const numericValue =
        Number.parseFloat(rawValue);

    return Number.isFinite(numericValue)
        ? numericValue
        : 0;
}

function buildAuthorityDecision() {
    const scores =
        typeof window.getModelScores ===
            "function"
            ? window.getModelScores()
            : [];

    if (scores.length === 0) {
        return {
            approved: false,
            status: "INCOMPLETE",
            reason:
                "Nėra modelių vertinimų.",
            average: 0,
            minimum: 0,
            maximum: 0,
            scoreGap: 0,
            conflicts: 0
        };
    }

    const scoreValues =
        scores.map(item => item.score);

    const average =
        scoreValues.reduce(
            (sum, score) => sum + score,
            0
        ) / scoreValues.length;

    const minimum =
        Math.min(...scoreValues);

    const maximum =
        Math.max(...scoreValues);

    const scoreGap =
        maximum - minimum;

    const conflicts =
        Array.isArray(
            appState.projectData.conflicts
        )
            ? appState.projectData.conflicts
            : [];

    const unresolvedConflicts =
        conflicts.filter(
            conflict =>
                !conflict.resolved
        );

    const targetMinimum =
        appState.settings
            .targetMinimumScore;

    const targetAverage =
        appState.settings
            .targetAverageScore;

    const maximumScoreGap =
        appState.settings
            .maximumScoreGap;

    let approved = true;
    const reasons = [];

    if (minimum < targetMinimum) {
        approved = false;

        reasons.push(
            "Minimalus balas " +
            minimum.toFixed(2) +
            " yra mažesnis už tikslą " +
            targetMinimum.toFixed(2) +
            "."
        );
    }

    if (average < targetAverage) {
        approved = false;

        reasons.push(
            "Vidurkis " +
            average.toFixed(2) +
            " yra mažesnis už tikslą " +
            targetAverage.toFixed(2) +
            "."
        );
    }

    if (scoreGap > maximumScoreGap) {
        approved = false;

        reasons.push(
            "Modelių balų skirtumas " +
            scoreGap.toFixed(2) +
            " viršija leidžiamą ribą " +
            maximumScoreGap.toFixed(2) +
            "."
        );
    }

    if (
        unresolvedConflicts.length > 0
    ) {
        approved = false;

        reasons.push(
            "Liko neišspręstų konfliktų: " +
            unresolvedConflicts.length +
            "."
        );
    }

    if (approved) {
        reasons.push(
            "Visi dabartiniai kokybės vartai įvykdyti."
        );
    }

    return {
        approved,

        status:
            approved
                ? "APPROVED"
                : "REVISION_REQUIRED",

        reason: reasons.join(" "),

        average:
            Number(average.toFixed(2)),

        minimum:
            Number(minimum.toFixed(2)),

        maximum:
            Number(maximum.toFixed(2)),

        scoreGap:
            Number(scoreGap.toFixed(2)),

        conflicts:
            unresolvedConflicts.length,

        evaluatedAt:
            new Date().toISOString()
    };
}

function finalAuthority() {
    /*
     * Visada perskaičiuojame konfliktus,
     * kad galutinis sprendimas nebūtų priimtas
     * pagal pasenusius duomenis.
     */
    if (
        typeof window.detectConflicts ===
        "function"
    ) {
        window.detectConflicts();
    }

    if (
        typeof window.buildConflictTree ===
        "function"
    ) {
        window.buildConflictTree();
    }

    const decision =
        buildAuthorityDecision();

    appState.projectData.finalDecision =
        decision;

    appState.projectData.consensus = {
        approved:
            decision.approved,

        average:
            decision.average,

        minimum:
            decision.minimum,

        maximum:
            decision.maximum,

        scoreGap:
            decision.scoreGap,

        conflicts:
            decision.conflicts
    };

    const output =
        document.getElementById(
            "finalAuthorityOutput"
        );

    if (output) {
        output.value =
            "Statusas: " +
            decision.status +
            "\n" +
            "Vidurkis: " +
            decision.average.toFixed(2) +
            "\n" +
            "Minimalus balas: " +
            decision.minimum.toFixed(2) +
            "\n" +
            "Balų skirtumas: " +
            decision.scoreGap.toFixed(2) +
            "\n" +
            "Neišspręsti konfliktai: " +
            decision.conflicts +
            "\n\n" +
            decision.reason;
    }

    const dashboardStatus =
        document.getElementById(
            "dashboardStatus"
        );

    if (dashboardStatus) {
        dashboardStatus.textContent =
            decision.approved
                ? "APPROVED"
                : "REVISION REQUIRED";
    }

    return decision;
}

window.buildAuthorityDecision =
    buildAuthorityDecision;

window.finalAuthority =
    finalAuthority;
