function detectConflicts() {

    const text =
        document
        .getElementById("arbitratorNotes")
        .value
        .toLowerCase();

    const conflicts = [];

    if(
        text.includes("per trump")
        &&
        text.includes("per ilgas")
    ){
        conflicts.push(
            "SUBJECTIVE_CONFLICT"
        );
    }

    if(
        text.includes("fakt")
    ){
        conflicts.push(
            "FACT_CONFLICT"
        );
    }

    if(
        text.includes("užduoties")
    ){
        conflicts.push(
            "TASK_CONFLICT"
        );
    }

    document
        .getElementById(
            "conflictOutput"
        )
        .value =
        conflicts.join("\n");

}
