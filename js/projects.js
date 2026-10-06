"use strict";

async function createProject() {

    const title =
        window.prompt(
            "Projekto pavadinimas"
        );

    if (
        !title ||
        !title.trim()
    ) {
        return null;
    }

    try {

        const project =
            await createProjectRecord({
                title:
                    title.trim(),

                task: "",
                text: "",
                arbitration: "",
                status: "draft"
            });

        await loadProjects();

        const projectList =
            document.getElementById(
                "projectList"
            );

        if (projectList) {
            projectList.value =
                project.id;
        }

        showProjectStatus(
            "Projektas sukurtas."
        );

        return project;

    } catch (error) {

        console.error(
            "Projekto kūrimo klaida:",
            error
        );

        showProjectStatus(
            "Nepavyko sukurti projekto.",
            true
        );

        return null;
    }
}

async function loadProjects() {

    const projectList =
        document.getElementById(
            "projectList"
        );

    if (!projectList) {
        return [];
    }

    try {

        const projects =
            await getAllProjectRecords();

        projectList.innerHTML = "";

        if (projects.length === 0) {

            const option =
                document.createElement(
                    "option"
                );

            option.value = "";
            option.textContent =
                "Projektų nėra";

            projectList.appendChild(
                option
            );

            return [];
        }

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

        return projects;

    } catch (error) {

        console.error(
            "Projektų įkėlimo klaida:",
            error
        );

        showProjectStatus(
            "Nepavyko įkelti projektų.",
            true
        );

        return [];
    }
}

async function loadSelectedProject() {

    const projectList =
        document.getElementById(
            "projectList"
        );

    if (
        !projectList ||
        !projectList.value
    ) {
        return null;
    }

    try {

        const project =
            await getProjectRecord(
                projectList.value
            );

        if (!project) {

            showProjectStatus(
                "Projektas nerastas.",
                true
            );

            return null;
        }

        fillProjectForm(
            project
        );

        showProjectStatus(
            "Projektas įkeltas."
        );

        return project;

    } catch (error) {

        console.error(
            "Projekto įkėlimo klaida:",
            error
        );

        showProjectStatus(
            "Nepavyko įkelti projekto.",
            true
        );

        return null;
    }
}

async function saveCurrentProject() {

    const projectList =
        document.getElementById(
            "projectList"
        );

    if (
        !projectList ||
        !projectList.value
    ) {

        showProjectStatus(
            "Pasirinkite projektą.",
            true
        );

        return null;
    }

    try {

        const existingProject =
            await getProjectRecord(
                projectList.value
            );

        if (!existingProject) {

            showProjectStatus(
                "Projektas nerastas.",
                true
            );

            return null;
        }

        const updatedProject = {
            ...existingProject,

            task:
                getFieldValue(
                    "task"
                ),

            text:
                getFieldValue(
                    "text"
                ),

            arbitration:
                getFieldValue(
                    "arbitratorNotes"
                )
        };

        await saveProjectRecord(
            updatedProject
        );

        await loadProjects();

        projectList.value =
            updatedProject.id;

        showProjectStatus(
            "Projektas išsaugotas."
        );

        return updatedProject;

    } catch (error) {

        console.error(
            "Projekto išsaugojimo klaida:",
            error
        );

        showProjectStatus(
            "Nepavyko išsaugoti projekto.",
            true
        );

        return null;
    }
}

async function deleteSelectedProject() {

    const projectList =
        document.getElementById(
            "projectList"
        );

    if (
        !projectList ||
        !projectList.value
    ) {

        showProjectStatus(
            "Pasirinkite projektą.",
            true
        );

        return;
    }

    const confirmed =
        window.confirm(
            "Ar tikrai ištrinti projektą?"
        );

    if (!confirmed) {
        return;
    }

    try {

        await deleteProjectRecord(
            projectList.value
        );

        clearProjectForm();

        await loadProjects();

        showProjectStatus(
            "Projektas ištrintas."
        );

    } catch (error) {

        console.error(
            "Trynimo klaida:",
            error
        );

        showProjectStatus(
            "Nepavyko ištrinti projekto.",
            true
        );
    }
}

function fillProjectForm(
    project
) {

    setFieldValue(
        "task",
        project.task
    );

    setFieldValue(
        "text",
        project.text
    );

    setFieldValue(
        "arbitratorNotes",
        project.arbitration
    );
}

function clearProjectForm() {

    setFieldValue(
        "task",
        ""
    );

    setFieldValue(
        "text",
        ""
    );

    setFieldValue(
        "arbitratorNotes",
        ""
    );
}

function getFieldValue(
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );

    return element
        ? element.value
        : "";
}

function setFieldValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.value =
            value || "";
    }
}

function showProjectStatus(
    message,
    isError = false
) {

    const status =
        document.getElementById(
            "projectStatus"
        );

    if (!status) {
        return;
    }

    status.textContent =
        message;

    status.style.color =
        isError
            ? "#b00020"
            : "#006400";
}

function initializeProjects() {

    const projectList =
        document.getElementById(
            "projectList"
        );

    if (projectList) {

        projectList.addEventListener(
            "change",
            function () {
                loadSelectedProject();
            }
        );
    }

    loadProjects();
}

window.createProject =
    createProject;

window.loadProjects =
    loadProjects;

window.loadSelectedProject =
    loadSelectedProject;

window.saveCurrentProject =
    saveCurrentProject;

window.deleteSelectedProject =
    deleteSelectedProject;

window.initializeProjects =
    initializeProjects;

window.addEventListener(
    "DOMContentLoaded",
    initializeProjects
);
