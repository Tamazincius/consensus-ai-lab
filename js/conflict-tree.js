function buildConflictTree(){

    const conflicts =
        document.getElementById(
            "conflictOutput"
        ).value;

    let result = "";

    if(
        conflicts.includes(
            "FACT_CONFLICT"
        )
    ){
        result +=
            "OBJECTIVE\n";
    }

    if(
        conflicts.includes(
            "SUBJECTIVE_CONFLICT"
        )
    ){
        result +=
            "SUBJECTIVE\n";
    }

    document
        .getElementById(
            "conflictTree"
        )
        .value =
        result;

}
