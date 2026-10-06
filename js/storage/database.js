"use strict";

const CONSENSUS_DATABASE_NAME =
    "consensus-ai-lab";

const CONSENSUS_DATABASE_VERSION =
    1;

const CONSENSUS_DATABASE_STORES =
    Object.freeze({
        PROJECTS: "projects",
        ITERATIONS: "iterations",
        REVIEWS: "reviews",
        CONFLICTS: "conflicts",
        SETTINGS: "settings"
    });

let consensusDatabasePromise = null;

function openConsensusDatabase() {
    if (consensusDatabasePromise) {
        return consensusDatabasePromise;
    }

    consensusDatabasePromise =
        new Promise(
            (resolve, reject) => {

                if (
                    !("indexedDB" in window)
                ) {
                    reject(
                        new Error(
                            "Ši naršyklė nepalaiko IndexedDB."
                        )
                    );

                    return;
                }

                const request =
                    window.indexedDB.open(
                        CONSENSUS_DATABASE_NAME,
                        CONSENSUS_DATABASE_VERSION
                    );

                request.onupgradeneeded =
                    function (event) {
                        const database =
                            event.target.result;

                        const transaction =
                            event.target.transaction;

                        createProjectsStore(
                            database
                        );

                        createIterationsStore(
                            database
                        );

                        createReviewsStore(
                            database
                        );

                        createConflictsStore(
                            database
                        );

                        createSettingsStore(
                            database
                        );

                        if (transaction) {
                            transaction.onerror =
                                function () {
                                    console.error(
                                        "Duomenų bazės struktūros kūrimo klaida:",
                                        transaction.error
                                    );
                                };
                        }
                    };

                request.onsuccess =
                    function (event) {
                        const database =
                            event.target.result;

                        database.onversionchange =
                            function () {
                                database.close();

                                consensusDatabasePromise =
                                    null;

                                console.warn(
                                    "Duomenų bazė uždaryta, nes pasikeitė jos versija."
                                );
                            };

                        resolve(database);
                    };

                request.onerror =
                    function () {
                        consensusDatabasePromise =
                            null;

                        reject(
                            request.error ||
                            new Error(
                                "Nepavyko atidaryti duomenų bazės."
                            )
                        );
                    };

                request.onblocked =
                    function () {
                        console.warn(
                            "Duomenų bazės atnaujinimas užblokuotas. " +
                            "Uždarykite kitus programos langus ir perkraukite puslapį."
                        );
                    };
            }
        );

    return consensusDatabasePromise;
}

function createProjectsStore(database) {
    if (
        database.objectStoreNames.contains(
            CONSENSUS_DATABASE_STORES.PROJECTS
        )
    ) {
        return;
    }

    const store =
        database.createObjectStore(
            CONSENSUS_DATABASE_STORES.PROJECTS,
            {
                keyPath: "id"
            }
        );

    store.createIndex(
        "title",
        "title",
        {
            unique: false
        }
    );

    store.createIndex(
        "status",
        "status",
        {
            unique: false
        }
    );

    store.createIndex(
        "updatedAt",
        "updatedAt",
        {
            unique: false
        }
    );
}

function createIterationsStore(database) {
    if (
        database.objectStoreNames.contains(
            CONSENSUS_DATABASE_STORES.ITERATIONS
        )
    ) {
        return;
    }

    const store =
        database.createObjectStore(
            CONSENSUS_DATABASE_STORES.ITERATIONS,
            {
                keyPath: "id"
            }
        );

    store.createIndex(
        "projectId",
        "projectId",
        {
            unique: false
        }
    );

    store.createIndex(
        "projectIteration",
        [
            "projectId",
            "iterationNumber"
        ],
        {
            unique: true
        }
    );

    store.createIndex(
        "createdAt",
        "createdAt",
        {
            unique: false
        }
    );
}

function createReviewsStore(database) {
    if (
        database.objectStoreNames.contains(
            CONSENSUS_DATABASE_STORES.REVIEWS
        )
    ) {
        return;
    }

    const store =
        database.createObjectStore(
            CONSENSUS_DATABASE_STORES.REVIEWS,
            {
                keyPath: "id"
            }
        );

    store.createIndex(
        "projectId",
        "projectId",
        {
            unique: false
        }
    );

    store.createIndex(
        "iterationId",
        "iterationId",
        {
            unique: false
        }
    );

    store.createIndex(
        "model",
        "model",
        {
            unique: false
        }
    );

    store.createIndex(
        "role",
        "role",
        {
            unique: false
        }
    );
}

function createConflictsStore(database) {
    if (
        database.objectStoreNames.contains(
            CONSENSUS_DATABASE_STORES.CONFLICTS
        )
    ) {
        return;
    }

    const store =
        database.createObjectStore(
            CONSENSUS_DATABASE_STORES.CONFLICTS,
            {
                keyPath: "id"
            }
        );

    store.createIndex(
        "projectId",
        "projectId",
        {
            unique: false
        }
    );

    store.createIndex(
        "iterationId",
        "iterationId",
        {
            unique: false
        }
    );

    store.createIndex(
        "resolved",
        "resolved",
        {
            unique: false
        }
    );

    store.createIndex(
        "severity",
        "severity",
        {
            unique: false
        }
    );
}

function createSettingsStore(database) {
    if (
        database.objectStoreNames.contains(
            CONSENSUS_DATABASE_STORES.SETTINGS
        )
    ) {
        return;
    }

    database.createObjectStore(
        CONSENSUS_DATABASE_STORES.SETTINGS,
        {
            keyPath: "key"
        }
    );
}

async function runDatabaseTransaction(
    storeName,
    mode,
    operation
) {
    const database =
        await openConsensusDatabase();

    return new Promise(
        (resolve, reject) => {
            let operationResult;

            const transaction =
                database.transaction(
                    storeName,
                    mode
                );

            const store =
                transaction.objectStore(
                    storeName
                );

            try {
                operationResult =
                    operation(
                        store,
                        transaction
                    );
            } catch (error) {
                transaction.abort();
                reject(error);
                return;
            }

            transaction.oncomplete =
                function () {
                    resolve(
                        operationResult
                    );
                };

            transaction.onerror =
                function () {
                    reject(
                        transaction.error ||
                        new Error(
                            "Duomenų bazės operacija nepavyko."
                        )
                    );
                };

            transaction.onabort =
                function () {
                    reject(
                        transaction.error ||
                        new Error(
                            "Duomenų bazės operacija nutraukta."
                        )
                    );
                };
        }
    );
}

function createDatabaseId(prefix) {
    const safePrefix =
        prefix || "record";

    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
            "function"
    ) {
        return (
            safePrefix +
            "-" +
            window.crypto.randomUUID()
        );
    }

    return (
        safePrefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(16)
            .slice(2)
    );
}

function requestToPromise(request) {
    return new Promise(
        (resolve, reject) => {

            request.onsuccess =
                function () {
                    resolve(
                        request.result
                    );
                };

            request.onerror =
                function () {
                    reject(
                        request.error ||
                        new Error(
                            "IndexedDB užklausa nepavyko."
                        )
                    );
                };
        }
    );
}

async function addDatabaseRecord(
    storeName,
    record
) {
    const database =
        await openConsensusDatabase();

    const transaction =
        database.transaction(
            storeName,
            "readwrite"
        );

    const store =
        transaction.objectStore(
            storeName
        );

    const request =
        store.add(record);

    return requestToPromise(
        request
    );
}

async function putDatabaseRecord(
    storeName,
    record
) {
    const database =
        await openConsensusDatabase();

    const transaction =
        database.transaction(
            storeName,
            "readwrite"
        );

    const store =
        transaction.objectStore(
            storeName
        );

    const request =
        store.put(record);

    return requestToPromise(
        request
    );
}

async function getDatabaseRecord(
    storeName,
    key
) {
    const database =
        await openConsensusDatabase();

    const transaction =
        database.transaction(
            storeName,
            "readonly"
        );

    const store =
        transaction.objectStore(
            storeName
        );

    const request =
        store.get(key);

    return requestToPromise(
        request
    );
}

async function getAllDatabaseRecords(
    storeName
) {
    const database =
        await openConsensusDatabase();

    const transaction =
        database.transaction(
            storeName,
            "readonly"
        );

    const store =
        transaction.objectStore(
            storeName
        );

    const request =
        store.getAll();

    return requestToPromise(
        request
    );
}

async function deleteDatabaseRecord(
    storeName,
    key
) {
    const database =
        await openConsensusDatabase();

    const transaction =
        database.transaction(
            storeName,
            "readwrite"
        );

    const store =
        transaction.objectStore(
            storeName
        );

    const request =
        store.delete(key);

    return requestToPromise(
        request
    );
}

async function verifyConsensusDatabase() {
    const database =
        await openConsensusDatabase();

    const existingStores =
        Array.from(
            database.objectStoreNames
        );

    const requiredStores =
        Object.values(
            CONSENSUS_DATABASE_STORES
        );

    const missingStores =
        requiredStores.filter(
            storeName =>
                !existingStores.includes(
                    storeName
                )
        );

    return {
        ready:
            missingStores.length === 0,

        databaseName:
            database.name,

        databaseVersion:
            database.version,

        stores:
            existingStores,

        missingStores
    };
}

window.CONSENSUS_DATABASE_NAME =
    CONSENSUS_DATABASE_NAME;

window.CONSENSUS_DATABASE_VERSION =
    CONSENSUS_DATABASE_VERSION;

window.CONSENSUS_DATABASE_STORES =
    CONSENSUS_DATABASE_STORES;

window.openConsensusDatabase =
    openConsensusDatabase;

window.runDatabaseTransaction =
    runDatabaseTransaction;

window.createDatabaseId =
    createDatabaseId;

window.verifyConsensusDatabase =
    verifyConsensusDatabase;

window.requestToPromise =
    requestToPromise;

window.addDatabaseRecord =
    addDatabaseRecord;

window.putDatabaseRecord =
    putDatabaseRecord;

window.getDatabaseRecord =
    getDatabaseRecord;

window.getAllDatabaseRecords =
    getAllDatabaseRecords;

window.deleteDatabaseRecord =
    deleteDatabaseRecord;
