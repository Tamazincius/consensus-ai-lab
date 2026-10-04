"use strict";

function getLoopRules() {
    return {
        maximumIterations:
            appState.settings.maximumIterations,

        stagnationLimit:
            appState.settings.stagnationLimit,

        minimumImprovement:
            appState.settings.minimumImprovement
    };
}

function calculateRecentImprovements(scores) {
    const improvements = [];

    for (let index = 1; index < scores.length; index += 1) {
        improvements.push(
            scores[index] - scores[index - 1]
        );
    }

    return improvements;
}

function hasStagnated(scores) {
    const rules = getLoopRules();

    if (
        scores.length <
        rules.stagnationLimit + 1
    ) {
        return false;
    }

    const recentScores = scores.slice(
        -(rules.stagnationLimit + 1)
    );

    const improvements =
        calculateRecentImprovements(recentScores);

    return improvements.every(
        improvement =>
            improvement <
            rules.minimumImprovement
    );
}

function hasRepeatedRegression(scores) {
    if (scores.length < 3) {
        return false;
    }

    const lastThree = scores.slice(-3);

    return (
        lastThree[1] < lastThree[0] &&
        lastThree[2] < lastThree[1]
    );
}

function evaluateLoopContinuation(consensusResult) {
    const rules = getLoopRules();
    const pipeline = appState.pipeline;

    if (pipeline.cancelled) {
        return {
            continue: false,
            reason: "cancelled",
            message: "Procesas nutrauktas"
        };
    }

    if (pipeline.paused) {
        return {
            continue: false,
            reason: "paused",
            message: "Procesas pristabdytas"
        };
    }

    if (consensusResult && consensusResult.approved) {
        return {
            continue: false,
            reason: "approved",
            message: "Kokybės tikslas pasiektas"
        };
    }

    if (
        pipeline.iteration >=
        rules.maximumIterations
    ) {
        return {
            continue: false,
            reason: "maximum-iterations",
            message:
                "Pasiektas maksimalus iteracijų skaičius"
        };
    }

    if (hasRepeatedRegression(
        pipeline.scoreHistory
    )) {
        return {
            continue: false,
            reason: "regression",
            message:
                "Aptikta regresija dviejose iteracijose iš eilės"
        };
    }

    if (hasStagnated(
        pipeline.scoreHistory
    )) {
        return {
            continue: false,
            reason: "stagnation",
            message:
                "Procesas sustabdytas dėl nepakankamos pažangos"
        };
    }

    return {
        continue: true,
        reason: "improvement-possible",
        message: "Galima pradėti kitą iteraciją"
    };
}
