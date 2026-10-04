const CACHE_NAME = "consensus-ai-lab-v3";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",

    "./css/main.css",

    "./js/app.js",
    "./js/consensus.js",
    "./js/storage.js",
    "./js/conflicts.js",
    "./js/authority.js",
    "./js/history.js",
    "./js/rollback.js",
    "./js/export.js",
    "./js/pdf.js",
    "./js/charts.js",
    "./js/import.js",
    "./js/conflict-tree.js",
    "./js/projects.js",
    "./js/json-import.js",
    "./js/workflow.js",
    "./js/docx-export.js",

    "./assets/icon-192.png",
    "./assets/icon-512.png",
    "./assets/apple-touch-icon.png",
    "./assets/favicon-32.png",
    "./assets/favicon-16.png",
    "./assets/logo.png"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })

    );

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if (key !== CACHE_NAME) {
                            return caches.delete(key);
                        }

                    })

                );

            })

    );

});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(response => {

                return response || fetch(event.request);

            })

    );

});
