function finalAuthority() {

    const avg =
        parseFloat(
            document
            .getElementById(
                "averageScore"
            )
            .innerText
        );

    const cons =
        parseFloat(
            document
            .getElementById(
                "consensusScore"
            )
            .innerText
        );

    const conflicts =
        document
        .getElementById(
            "conflictOutput"
        )
        .value;

    let verdict =
        "CONTINUE_IMPROVEMENT";

    if(
        avg >= 9.6
        &&
        cons >= 85
        &&
        !conflicts.includes(
            "FACT_CONFLICT"
        )
    ){
        verdict = "APPROVED";
    }

    document
        .getElementById(
            "finalAuthority"
        )
        .value =
        verdict;
}
