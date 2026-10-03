function saveVersion() {

    const versions =
        JSON.parse(
            localStorage.getItem(
                "versions"
            )
            || "[]"
        );

    versions.push({

        date:
            new Date()
            .toISOString(),

        task:
            document
            .getElementById(
                "task"
            )
            .value,

        text:
            document
            .getElementById(
                "text"
            )
            .value

    });

    localStorage.setItem(
        "versions",
        JSON.stringify(
            versions
        )
    );

    loadVersions();
}

function loadVersions(){

    const versions =
        JSON.parse(
            localStorage.getItem(
                "versions"
            )
            || "[]"
        );

    const select =
        document
        .getElementById(
            "versionList"
        );

    select.innerHTML = "";

    versions.forEach(
        (v,index)=>{

        const option =
            document
            .createElement(
                "option"
            );

        option.value =
            index;

        option.text =
            "v"+
            (index+1)+
            " | "+
            v.date;

        select.appendChild(
            option
        );

    });

}
