"use strict";

const APP_VERSION = "0.5.4";

const CACHE_PREFIX =
    "consensus-ai-lab-";

const CACHE_NAME =
    CACHE_PREFIX + APP_VERSION;

const REQUIRED_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/main.css",

    "./js/state.js",
    "./js/storage/database.js",
    "./js/storage/projects-store.js",

    "./js/workflow/pipeline-state.js",
    "./js/workflow/loop-controller.js",
    "./js/workflow/orchestrator.js",
    "./js/workflow/workflow.js",

    "./js/app.js"
];

const OPTIONAL_FILES = [
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

    "./assets/icon-192.png",
    "./assets/icon-512.png",
    "./assets/apple-touch-icon.png",
    "./assets/favicon-32.png",
    "./assets/favicon-16.png",
    "./assets/logo.png"
];

self.addEventListener(
    "install",
    event => {

        event.waitUntil(
            installApplicationCache()
        );

    }
);

async function installApplicationCache() {

    const cache =
        await caches.open(CACHE_NAME);

    await cache.addAll(
        REQUIRED_FILES
    );

    const results =
        await Promise.allSettled(
            OPTIONAL_FILES.map(
                file => cache.add(file)
            )
        );

    results.forEach(
        (result, index) => {

            if (
                result.status ===
                "rejected"
            ) {
                console.warn(
                    "Papildomas failas neįrašytas į cache:",
                    OPTIONAL_FILES[index],
                    result.reason
                );
            }

        }
    );

    console.log(
        "Įdiegtas programos cache:",
        CACHE_NAME
    );

}

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(
            activateApplicationCache()
        );

    }
);

async function activateApplicationCache() {

    const cacheNames =
        await caches.keys();

    await Promise.all(
        cacheNames.map(
            cacheName => {

                const isOldApplicationCache =
                    cacheName.startsWith(
                        CACHE_PREFIX
                    ) &&
                    cacheName !==
                        CACHE_NAME;

                if (
                    isOldApplicationCache
                ) {
                    return caches.delete(
                        cacheName
                    );
                }

                return Promise.resolve(
                    false
                );

            }
        )
    );

    await self.clients.claim();

    console.log(
        "Aktyvus programos cache:",
        CACHE_NAME
    );

}

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;

        if (
            request.method !== "GET"
        ) {
            return;
        }

        const url =
            new URL(request.url);

        if (
            isApiRequest(url)
        ) {
            event.respondWith(
                fetch(request)
            );

            return;
        }

        if (
            isNavigationRequest(request)
        ) {
            event.respondWith(
                networkFirst(
                    request,
                    "./index.html"
                )
            );

            return;
        }

        if (
            isManifestRequest(url)
        ) {
            event.respondWith(
                networkFirst(request)
            );

            return;
        }

        if (
            isLocalJavaScriptOrCss(url)
        ) {
            event.respondWith(
                staleWhileRevalidate(
                    request
                )
            );

            return;
        }

        if (
            isImageOrFontRequest(
                request
            )
        ) {
            event.respondWith(
                cacheFirst(request)
            );

            return;
        }

        event.respondWith(
            networkFirst(request)
        );

    }
);

function isNavigationRequest(
    request
) {

    const acceptedContent =
        request.headers.get(
            "accept"
        ) || "";

    return (
        request.mode ===
            "navigate" ||
        acceptedContent.includes(
            "text/html"
        )
    );

}

function isManifestRequest(url) {

    return url.pathname.endsWith(
        "/manifest.json"
    );

}

function isApiRequest(url) {

    return (
        url.pathname.includes(
            "/api/"
        ) ||
        url.hostname ===
            "openrouter.ai"
    );

}

function isLocalJavaScriptOrCss(
    url
) {

    return (
        url.origin ===
            self.location.origin &&
        (
            url.pathname.endsWith(
                ".js"
            ) ||
            url.pathname.endsWith(
                ".css"
            )
        )
    );

}

function isImageOrFontRequest(
    request
) {

    return (
        request.destination ===
            "image" ||
        request.destination ===
            "font"
    );

}

async function networkFirst(
    request,
    fallbackPath = null
) {

    try {

        const networkResponse =
            await fetch(request);

        if (
            isCacheableResponse(
                networkResponse
            )
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
            await caches.match(
                request
            );

        if (cachedResponse) {
            return cachedResponse;
        }

        if (fallbackPath) {

            const fallbackResponse =
                await caches.match(
                    fallbackPath
                );

            if (fallbackResponse) {
                return fallbackResponse;
            }

        }

        throw error;

    }

}

async function cacheFirst(
    request
) {

    const cachedResponse =
        await caches.match(
            request
        );

    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse =
        await fetch(request);

    if (
        isCacheableResponse(
            networkResponse
        )
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

async function staleWhileRevalidate(
    request
) {

    const cache =
        await caches.open(
            CACHE_NAME
        );

    const cachedResponse =
        await cache.match(
            request
        );

    const networkRequest =
        fetch(request)
            .then(
                async networkResponse => {

                    if (
                        isCacheableResponse(
                            networkResponse
                        )
                    ) {
                        await cache.put(
                            request,
                            networkResponse.clone()
                        );
                    }

                    return networkResponse;

                }
            )
            .catch(
                error => {

                    console.warn(
                        "Nepavyko atnaujinti failo:",
                        request.url,
                        error
                    );

                    return null;

                }
            );

    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse =
        await networkRequest;

    if (networkResponse) {
        return networkResponse;
    }

    throw new Error(
        "Išteklius nepasiekiamas: " +
        request.url
    );

}

function isCacheableResponse(
    response
) {

    return Boolean(
        response &&
        response.ok &&
        response.type !==
            "error"
    );

}

self.addEventListener(
    "message",
    event => {

        if (
            event.data &&
            event.data.type ===
                "SKIP_WAITING"
        ) {
            self.skipWaiting();
            return;
        }

        if (
            event.data &&
            event.data.type ===
                "GET_VERSION"
        ) {
            event.source?.postMessage({
                type:
                    "APP_VERSION",
                version:
                    APP_VERSION,
                cacheName:
                    CACHE_NAME
            });
        }

    }
);
