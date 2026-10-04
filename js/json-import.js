function importProject(){

    const input =
        document
        .getElementById(
            "jsonImport"
        )
        .value;

    try{

        const data =
            JSON.parse(
                input
            );

        document
            .getElementById(
                "task"
            )
            .value =
            data.task;

        document
            .getElementById(
                "text"
            )
            .value =
            data.text;

    }

    catch{

        alert(
            "Neteisingas JSON"
        );

    }

}
