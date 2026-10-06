"use strict";

function normalizeProjectRecord(
    project
) {
    if (!project) {
        throw new Error(
            "Nepateikti projekto duomenys."
        );
    }

    const now =
        new Date().toISOString();

    return {
        id:
            project.id ||
            createDatabaseId(
                "project"
            ),

        title:
            String(
                project.title ||
                "Projektas be pavadinimo"
            ).trim(),

        task:
            String(
                project.task || ""
            ),

        text:
            String(
                project.text || ""
            ),

        arbitration:
            String(
                project.arbitration || ""
            ),

        status:
            project.status ||
            "draft",

        currentIteration:
            Number.isFinite(
                project.currentIteration
            )
                ? project.currentIteration
                : 0,

        createdAt:
            project.createdAt ||
            now,

        updatedAt:
            now
    };
}

async function createProjectRecord(
    project
) {
    const record =
        normalizeProjectRecord(
            project
        );

    await addDatabaseRecord(
        CONSENSUS_DATABASE_STORES.PROJECTS,
        record
    );

    return record;
}

async function saveProjectRecord(
    project
) {
    const record =
        normalizeProjectRecord(
            project
        );

    await putDatabaseRecord(
        CONSENSUS_DATABASE_STORES.PROJECTS,
        record
    );

    return record;
}

async function getProjectRecord(
    projectId
) {
    if (!projectId) {
        return null;
    }

    return getDatabaseRecord(
        CONSENSUS_DATABASE_STORES.PROJECTS,
        projectId
    );
}

async function getAllProjectRecords() {
    const projects =
        await getAllDatabaseRecords(
            CONSENSUS_DATABASE_STORES.PROJECTS
        );

    return (
        Array.isArray(projects)
            ? projects
            : []
    ).sort(
        (first, second) =>
            String(
                second.updatedAt || ""
            ).localeCompare(
                String(
                    first.updatedAt || ""
                )
            )
    );
}

async function deleteProjectRecord(
    projectId
) {
    await deleteDatabaseRecord(
        CONSENSUS_DATABASE_STORES.PROJECTS,
        projectId
    );

    return true;
}

async function setCurrentProject(
    projectId
) {
    const project =
        await getProjectRecord(
            projectId
        );

    if (!project) {
        return null;
    }

    appState.currentProject =
        project.id;

    localStorage.setItem(
        "consensus-current-project-id",
        project.id
    );

    return project;
}

async function getCurrentProject() {

    const projectId =
        appState.currentProject ||
        localStorage.getItem(
            "consensus-current-project-id"
        );

    if (!projectId) {
        return null;
    }

    return getProjectRecord(
        projectId
    );
}

window.setCurrentProject =
    setCurrentProject;

window.getCurrentProject =
    getCurrentProject;

window.normalizeProjectRecord =
    normalizeProjectRecord;

window.createProjectRecord =
    createProjectRecord;

window.saveProjectRecord =
    saveProjectRecord;

window.getProjectRecord =
    getProjectRecord;

window.getAllProjectRecords =
    getAllProjectRecords;

window.deleteProjectRecord =
    deleteProjectRecord;
