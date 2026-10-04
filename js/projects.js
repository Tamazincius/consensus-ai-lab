function createProject(){

    const title =
        prompt(
            "Projekto pavadinimas"
        );

    if(!title) return;

    const projects =
        JSON.parse(
            localStorage.getItem(
                "projects"
            ) || "[]"
        );

    projects.push({

        title

    });

    localStorage.setItem(

        "projects",

        JSON.stringify(
            projects
        )

    );

    loadProjects();

}
