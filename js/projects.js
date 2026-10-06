"use strict";

async function createProject() {

    const title =
        prompt(
            "Projekto pavadinimas"
        );

    if (
        !title ||
        !title.trim()
    ) {
        return;
    }

    await createProjectRecord({
        title:
            title.trim(),

        task: "",
        text: "",
        arbitration: "",
        status: "draft"
    });

    await loadProjects();
}

async function loadProjects() {

    const projectList =
        document.getElementById(
            "projectList"
        );

    if (!projectList) {
        return;
    }

    const projects =
        await getAllProjectRecords();

    projectList.innerHTML = "";

    projects.forEach(
        project => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                project.id;

            option.textContent =
                project.title;

            projectList.appendChild(
                option
            );
        }
    );
}

window.createProject =
    createProject;

window.loadProjects =
    loadProjects;

window.addEventListener(
    "DOMContentLoaded",
    function () {
        loadProjects();
    }
);
