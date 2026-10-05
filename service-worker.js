"use strict";

/*
 * Pakeiskite versijos numerį kiekvieną kartą,
 * kai atnaujinate programos failus.
 */
const APP_VERSION = "0.4.0";

const CACHE_NAME =
    "consensus-ai-lab-" + APP_VERSION;

/*
 * Minimalūs failai, be kurių programa negali veikti.
 * Jei kurio nors iš jų nėra, Service Worker diegimas
 * bus laikomas nesėkmingu.
 */
const REQUIRED_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/main.css"
];

/*
 * Papildomi programos failai.
 * Kiekvienas failas kešuojamas atskirai, todėl vieno
 * trūkstamo failo klaida nesustabdys viso diegimo.
 */
const OPTIONAL_FILES = [
    "./js/state.js",

    "./js/consensus.js",
    "./js/storage.js",
    "./js/conflicts.js",
    "./js/authority.js",
    "./js/history.js",
    "./js/export.js",
    "./js/pdf.js",
    "./js/docx-export.js",
    "./js/charts.js",
    "./js/rollback.js",
    "./js/import.js",
    "./js/conflict-tree.js",
    "./js/projects.js",
    "./js/json-import.js",

    "./js/workflow/pipeline-state.js",
    "./js/workflow/loop-controller.js",
    "./js/workflow/orchestrator.js",
    "./js/workflow/workflow.js",

    "./js/app.js",

    "./assets/icon-192.png",
    "./assets/icon-512.png",
    "./assets/apple-touch-icon.png",
    "./assets/favicon-32.png",
    "./assets/favicon-16.png",
    "./assets/logo.png"
];

/*
 * Diegimas.
 *
 * Pirmiausia įrašomi privalomi failai.
 * Po to bandoma atskirai įrašyti papildomus failus.
 */
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {

                await cache.addAll(REQUIRED_FILES);

                const optionalResults =
                    await Promise.allSettled(
                        OPTIONAL_FILES.map(file => {

                            return cache.add(file);

                        })
                    );

                optionalResults.forEach(
                    (result, index) => {

                        if (
                            result.status ===
                            "rejected"
                        ) {
                            console.warn(
                                "Nepavyko įrašyti į cache:",
                                OPTIONAL_FILES[index],
                                result.reason
                            );
                        }

                    }
                );

                /*
                 * Naujas Service Worker pereina
                 * į waiting būseną. Jis nebus priverstinai
                 * aktyvuojamas, jei veikia sena programos
                 * versija.
                 */
                console.log(
                    "Service Worker įdiegtas:",
                    CACHE_NAME
                );

            })
            .catch(error => {

                console.error(
                    "Service Worker diegimo klaida:",
                    error
                );

                throw error;

            })
    );

});

/*
 * Aktyvavimas.
 *
 * Ištrinamos visos ankstesnių programos versijų
 * talpyklos.
 */
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {

                return Promise.all(
                    cacheNames.map(cacheName => {

                        const isOldConsensusCache =
                            cacheName.startsWith(
                                "consensus-ai-lab-"
                            ) &&
                            cacheName !== CACHE_NAME;

                        if (isOldConsensusCache) {
                            console.log(
                                "Šalinamas senas cache:",
                                cacheName
                            );

                            return caches.delete(
                                cacheName
                            );
                        }

                        return Promise.resolve(
                            false
                        );

                    })
                );

            })
            .then(() => {

                /*
                 * Leidžiama Service Worker valdyti
                 * jau atidarytus programos langus.
                 */
                return self.clients.claim();

            })
    );

});

/*
 * Patikrina, ar užklausa yra navigacijos užklausa.
 */
function isNavigationRequest(request) {

    return (
        request.mode === "navigate" ||
        (
            request.method === "GET" &&
            request.headers
                .get("accept")
                ?.includes("text/html")
        )
    );

}

/*
 * Patikrina, ar failas yra manifestas.
 */
function isManifestRequest(url) {

    return (
        url.pathname.endsWith(
            "/manifest.json"
        )
    );

}

/*
 * Patikrina, ar užklausa skirta programos API.
 *
 * Ateityje čia galima pridėti Cloudflare Worker
 * URL dalį. API atsakymai neturi būti saugomi
 * bendroje programos talpykloje.
 */
function isApiRequest(url) {

    return (
        url.pathname.includes("/api/") ||
        url.hostname.includes(
            "openrouter.ai"
        )
    );

}

/*
 * Network-first strategija.
 *
 * Pirmiausia bandoma gauti naujausią failą iš tinklo.
 * Jei tinklas nepasiekiamas, naudojama cache versija.
 */
async function networkFirst(request) {

    try {
        const networkResponse =
            await fetch(request);

        if (
            networkResponse &&
            networkResponse.ok
        ) {
            const cache =
                await caches.open(
                    CACHE_NAME
                );

            await cache.put(
                request,
                networkResponse.clone()
            );
        }

        return networkResponse;

    } catch (error) {

        const cachedResponse =
            await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        if (
            isNavigationRequest(request)
        ) {
            const cachedIndex =
                await caches.match(
                    "./index.html"
                );

            if (cachedIndex) {
                return cachedIndex;
            }
        }

        throw error;

    }

}

/*
 * Cache-first strategija.
 *
 * Pirmiausia naudojama vietinė failo kopija.
 * Jei jos nėra, failas gaunamas iš tinklo ir
 * įrašomas į cache.
 */
async function cacheFirst(request) {

    const cachedResponse =
        await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse =
        await fetch(request);

    if (
        networkResponse &&
        networkResponse.ok
    ) {
        const cache =
            await caches.open(
                CACHE_NAME
            );

        await cache.put(
            request,
            networkResponse.clone()
        );
    }

    return networkResponse;

}

/*
 * Stale-while-revalidate strategija.
 *
 * Iš karto grąžinama cache versija, o fone
 * bandoma parsisiųsti naujesnę failo versiją.
 */
async function staleWhileRevalidate(
    request
) {

    const cache =
        await caches.open(CACHE_NAME);

    const cachedResponse =
        await cache.match(request);

    const networkPromise =
        fetch(request)
            .then(networkResponse => {

                if (
                    networkResponse &&
                    networkResponse.ok
                ) {
                    cache.put(
                        request,
                        networkResponse.clone()
                    );
                }

                return networkResponse;

            })
            .catch(error => {

                console.warn(
                    "Foninio atnaujinimo klaida:",
                    request.url,
                    error
                );

                return null;

            });

    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse =
        await networkPromise;

    if (networkResponse) {
        return networkResponse;
    }

    throw new Error(
        "Failas nepasiekiamas: " +
        request.url
    );

}

/*
 * Užklausų apdorojimas.
 */
self.addEventListener("fetch", event => {

    const request = event.request;

    /*
     * Kešuojamos tik GET užklausos.
     */
    if (request.method !== "GET") {
        return;
    }

    const url =
        new URL(request.url);

    /*
     * DI ir kitos API užklausos visada siunčiamos
     * tiesiai į tinklą ir nėra kešuojamos.
     */
    if (isApiRequest(url)) {

        event.respondWith(
            fetch(request)
        );

        return;

    }

    /*
     * Navigacijai ir HTML naudojama network-first
     * strategija, kad vartotojas gautų naujausią
     * programos versiją.
     */
    if (isNavigationRequest(request)) {

        event.respondWith(
            networkFirst(request)
        );

        return;

    }

    /*
     * Manifestas taip pat tikrinamas tinkle
     * pirmiausia, nes naršyklės jį stipriai kešuoja.
     */
    if (isManifestRequest(url)) {

        event.respondWith(
            networkFirst(request)
        );

        return;

    }

    /*
     * Tos pačios kilmės JavaScript ir CSS failams
     * naudojama stale-while-revalidate strategija.
     */
    if (
        url.origin ===
            self.location.origin &&
        (
            url.pathname.endsWith(".js") ||
            url.pathname.endsWith(".css")
        )
    ) {

        event.respondWith(
            staleWhileRevalidate(request)
        );

        return;

    }

    /*
     * Ikonoms, paveikslėliams ir šriftams naudojama
     * cache-first strategija.
     */
    if (
        request.destination === "image" ||
        request.destination === "font"
    ) {

        event.respondWith(
            cacheFirst(request)
        );

        return;

    }

    /*
     * Išorinėms CDN bibliotekoms ir kitiems
     * ištekliams pirmiausia naudojamas tinklas.
     */
    event.respondWith(
        networkFirst(request)
    );

});

/*
 * Leidžia programai pranešti Service Worker,
 * kad nauja versija gali būti aktyvuota.
 */
self.addEventListener("message", event => {

    if (
        event.data &&
        event.data.type ===
            "SKIP_WAITING"
    ) {
        self.skipWaiting();
    }

    if (
        event.data &&
        event.data.type ===
            "GET_VERSION"
    ) {
        event.source?.postMessage({
            type: "APP_VERSION",
            version: APP_VERSION,
            cacheName: CACHE_NAME
        });
    }

});
