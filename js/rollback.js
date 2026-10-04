function rollbackVersion(){

    const versions =
        JSON.parse(
            localStorage
            .getItem(
                "versions"
            ) || "[]"
        );

    const index =
        document
        .getElementById(
            "versionList"
        )
        .value;

    const version =
        versions[index];

    if(
        !version
    ){
        return;
    }

    document
    .getElementById(
        "task"
    )
    .value =
    version.task;

    document
    .getElementById(
        "text"
    )
    .value =
    version.text;
}
