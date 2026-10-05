"use strict";

function buildConflictTree() {
    const output =
        document.getElementById(
            "conflictTree"
        );

    let conflicts =
        Array.isArray(
            appState.projectData.conflicts
        )
            ? appState.projectData.conflicts
            : [];

    /*
     * Jei konfliktai dar nebuvo apskaičiuoti,
     * funkcija iškviečia jų analizę.
     */
    if (
        conflicts.length === 0 &&
        typeof window.detectConflicts ===
            "function"
    ) {
        conflicts =
            window.detectConflicts();
    }

    if (!output) {
        console.warn(
            "Nerastas conflictTree laukas."
        );

        return null;
    }

    if (
        !Array.isArray(conflicts) ||
        conflicts.length === 0
    ) {
        output.value =
            "CONFLICT TREE\n" +
            "└── Reikšmingų konfliktų nėra";

        return {
            conflictCount: 0,
            criticalCount: 0,
            highCount: 0,
            mediumCount: 0,
            unresolvedCount: 0,
            conflicts: []
        };
    }

    const criticalConflicts =
        conflicts.filter(
            conflict =>
                conflict.severity ===
                "critical"
        );

    const highConflicts =
        conflicts.filter(
            conflict =>
                conflict.severity ===
                "high"
        );

    const mediumConflicts =
        conflicts.filter(
            conflict =>
                conflict.severity ===
                "medium"
        );

    const unresolvedConflicts =
        conflicts.filter(
            conflict =>
                !conflict.resolved
        );

    const lines = [
        "CONFLICT TREE",
        "│",
        "├── Visi konfliktai: " +
            conflicts.length,
        "│",
        "├── Kritiniai: " +
            criticalConflicts.length,
        "├── Aukšto lygio: " +
            highConflicts.length,
        "├── Vidutinio lygio: " +
            mediumConflicts.length,
        "├── Neišspręsti: " +
            unresolvedConflicts.length,
        "│"
    ];

    conflicts.forEach(
        (conflict, index) => {
            const isLast =
                index ===
                conflicts.length - 1;

            const branch =
                isLast ? "└──" : "├──";

            lines.push(
                branch +
                " Konfliktas " +
                (index + 1)
            );

            lines.push(
                (isLast ? "    " : "│   ") +
                "├─ " +
                conflict.firstModel +
                ": " +
                conflict.firstScore.toFixed(2)
            );

            lines.push(
                (isLast ? "    " : "│   ") +
                "├─ " +
                conflict.secondModel +
                ": " +
                conflict.secondScore.toFixed(2)
            );

            lines.push(
                (isLast ? "    " : "│   ") +
                "├─ Skirtumas: " +
                conflict.difference.toFixed(2)
            );

            lines.push(
                (isLast ? "    " : "│   ") +
                "└─ Būsena: " +
                (
                    conflict.resolved
                        ? "išspręstas"
                        : "neišspręstas"
                )
            );
        }
    );

    output.value = lines.join("\n");

    const result = {
        conflictCount: conflicts.length,

        criticalCount:
            criticalConflicts.length,

        highCount:
            highConflicts.length,

        mediumCount:
            mediumConflicts.length,

        unresolvedCount:
            unresolvedConflicts.length,

        conflicts
    };

    appState.projectData.conflictTree =
        result;

    return result;
}

window.buildConflictTree = buildConflictTree;
