const CACHE_NAME = "keevo-v3";


const APP_FILES = [

    "./",

    "./index.html",

    "./login.html",

    "./create-account.html",

    "./forgot-password.html",

    "./reset-password.html",

    "./dashboard.html",

    "./add-bill.html",

    "./my-bills.html",

    "./bill-details.html",

    "./daily-expenses.html",

    "./summary.html",

    "./profile.html",

    "./manifest.json",

    "./icon-192.png",

    "./icon-512.png"

];


/* =================================
   INSTALL
================================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    cache => {

                        return cache.addAll(
                            APP_FILES
                        );

                    }
                )

        );

        /*
           Activate the new
           service worker immediately.
        */

        self.skipWaiting();

    }
);


/* =================================
   ACTIVATE
================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    cacheNames => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    name =>
                                        name !== CACHE_NAME
                                )
                                .map(
                                    name =>
                                        caches.delete(name)
                                )

                        );

                    }
                )

        );


        /*
           Take control of all
           open BillSafe pages.
        */

        self.clients.claim();

    }
);


/* =================================
   FETCH
================================= */

self.addEventListener(
    "fetch",
    event => {

        /*
           Only handle GET requests.
        */

        if(
            event.request.method !== "GET"
        ){

            return;

        }


        event.respondWith(

            fetch(
                event.request
            )

            .then(
                response => {

                    /*
                       Save successful
                       same-origin responses
                       into the current cache.
                    */

                    if(

                        response &&

                        response.status === 200 &&

                        new URL(
                            event.request.url
                        ).origin ===
                        self.location.origin

                    ){

                        const responseClone =
                            response.clone();


                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(
                                cache => {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                }
                            );

                    }


                    return response;

                }
            )

            .catch(
                () => {

                    /*
                       If network fails,
                       try the cached version.
                    */

                    return caches.match(
                        event.request
                    );

                }
            )

        );

    }
);