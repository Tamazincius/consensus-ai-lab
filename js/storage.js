function saveProject() {

    const project = {

        task:
            document.getElementById("task").value,

        text:
            document.getElementById("text").value,

        arbitration:
            document.getElementById(
                "arbitratorNotes"
            ).value
    };

    localStorage.setItem(
        "consensus-project",
        JSON.stringify(project)
    );
}

function loadProject() {

    const data =
        localStorage.getItem(
            "consensus-project"
        );

    if(!data) return;

    const project =
        JSON.parse(data);

    document.getElementById(
        "task"
    ).value =
        project.task || "";

    document.getElementById(
        "text"
    ).value =
        project.text || "";

    document.getElementById(
        "arbitratorNotes"
    ).value =
        project.arbitration || "";
}

window.onload =
    loadProject;
