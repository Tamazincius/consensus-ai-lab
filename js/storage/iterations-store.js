"use strict";

async function saveIterationRecord(
    iteration
) {
    const record = {
        id:
            iteration.id ||
            createDatabaseId(
                "iteration"
            ),

        projectId:
            iteration.projectId,

        iterationNumber:
            Number(
                iteration.iterationNumber || 0
            ),

        task:
            iteration.task || "",

        text:
            iteration.text || "",

        averageScore:
            iteration.averageScore ?? null,

        minimumScore:
            iteration.minimumScore ?? null,

        maximumScore:
            iteration.maximumScore ?? null,

        consensusPercentage:
            iteration.consensusPercentage ?? null,

        arbitration:
            iteration.arbitration || "",

        createdAt:
            iteration.createdAt ||
            new Date().toISOString()
    };

    await putDatabaseRecord(
        CONSENSUS_DATABASE_STORES.ITERATIONS,
        record
    );

    return record;
}

async function getProjectIterations(
    projectId
) {
    const database =
        await openConsensusDatabase();

    const transaction =
        database.transaction(
            CONSENSUS_DATABASE_STORES.ITERATIONS,
            "readonly"
        );

    const store =
        transaction.objectStore(
            CONSENSUS_DATABASE_STORES.ITERATIONS
        );

    const index =
        store.index("projectId");

    const request =
        index.getAll(projectId);

    const records =
        await requestToPromise(
            request
        );

    return records.sort(
        (a, b) =>
            a.iterationNumber -
            b.iterationNumber
    );
}

async function getIterationRecord(
    iterationId
) {
    return getDatabaseRecord(
        CONSENSUS_DATABASE_STORES.ITERATIONS,
        iterationId
    );
}

async function deleteProjectIterations(
    projectId
) {
    const records =
        await getProjectIterations(
            projectId
        );

    for (const record of records) {
        await deleteDatabaseRecord(
            CONSENSUS_DATABASE_STORES.ITERATIONS,
            record.id
        );
    }

    return true;
}

window.saveIterationRecord =
    saveIterationRecord;

window.getProjectIterations =
    getProjectIterations;

window.getIterationRecord =
    getIterationRecord;

window.deleteProjectIterations =
    deleteProjectIterations;
