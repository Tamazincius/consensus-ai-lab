const CACHE =
    "consensus-v1";

self.addEventListener(
    "install",

    event => {

        event.waitUntil(

            caches.open(CACHE)
            .then(cache =>

                cache.addAll([

                    "/",

                    "/index.html",

                    "/css/main.css",

                    "/js/app.js"

                ])

            )

        );

    }

);
