const games = [
    {
        placeId: 6229116934,
        universeId: 2287245386,

        onlineCountElementId:
            "hoopzOnlineCount",

        visitCountElementId:
            "hoopzVisitCount",

        thumbnailElementId:
            "hoopzThumbnail",

        playing: 0,
        visits: 0,

        thumbnailUrl: "",

        backupThumbnailUrl:
            "assets/img/hoopz.png"
    },

    {
        placeId: 15564827526,
        universeId: 5372679817,

        onlineCountElementId:
            "blockPuzzleOnlineCount",

        visitCountElementId:
            "blockPuzzleVisitCount",

        thumbnailElementId:
            "blockPuzzleThumbnail",

        playing: 0,
        visits: 0,

        thumbnailUrl: "",

        backupThumbnailUrl:
            "assets/img/blockpuzzle.png"
    }
];


let initialStatsLoaded = false;


/* =========================================================
   NUMBER FORMATTING
   ========================================================= */

function formatNumber(number) {
    const suffixes = [
        "",
        "K",
        "M",
        "B",
        "T"
    ];

    let value =
        Number(number) || 0;

    let suffixIndex = 0;


    while (
        value >= 1000 &&
        suffixIndex <
            suffixes.length - 1
    ) {
        value /= 1000;

        suffixIndex++;
    }


    return (
        value.toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 1
            }
        ) +
        suffixes[suffixIndex]
    );
}


/* =========================================================
   SAFE TEXT UPDATE
   ========================================================= */

function setTextIfChanged(
    element,
    text
) {
    if (!element) {
        return;
    }

    const value =
        String(text);


    /*
        Don't touch the DOM when the
        displayed value is already correct.
    */

    if (
        element.textContent.trim() ===
        value
    ) {
        return;
    }


    element.textContent =
        value;
}


/* =========================================================
   PLAYER NUMBER
   ========================================================= */

function updatePlayerNumber(
    element,
    value,
    animate = false
) {
    if (!element) {
        return;
    }


    const numericValue =
        Number(value) || 0;


    const oldValue =
        Number(
            element.dataset.value
        );


    /*
        Absolutely nothing changed.
    */

    if (
        Number.isFinite(oldValue) &&
        oldValue === numericValue
    ) {
        return;
    }


    element.dataset.value =
        String(numericValue);


    /*
        Odometer ONLY runs during the
        initial page load.
    */

    if (
        animate &&
        typeof Odometer !==
            "undefined"
    ) {
        if (!element._odometer) {
            element._odometer =
                new Odometer({
                    el: element,

                    value:
                        Number.isFinite(
                            oldValue
                        )
                            ? oldValue
                            : 0,

                    duration: 850
                });
        }


        element._odometer.update(
            numericValue
        );

        return;
    }


    /*
        Background refreshes update
        silently.
    */

    setTextIfChanged(
        element,

        numericValue.toLocaleString(
            "en-US"
        )
    );
}


/* =========================================================
   TOTAL LIVE PLAYERS
   ========================================================= */

function updateTotalPlayers() {
    const element =
        document.getElementById(
            "totalPlayersOnline"
        );


    if (!element) {
        return;
    }


    const total =
        games.reduce(
            (sum, game) => {
                return (
                    sum +
                    Number(
                        game.playing || 0
                    )
                );
            },
            0
        );


    setTextIfChanged(
        element,

        total.toLocaleString(
            "en-US"
        )
    );
}


/* =========================================================
   TOTAL GAME VISITS
   ========================================================= */

function updateTotalGameVisits() {
    const element =
        document.getElementById(
            "totalGameVisits"
        );


    if (!element) {
        return;
    }


    /*
        Don't display the combined number
        until both games returned data.
    */

    const ready =
        games.every(
            game =>
                Number(
                    game.visits
                ) > 0
        );


    if (!ready) {
        return;
    }


    const total =
        games.reduce(
            (sum, game) => {
                return (
                    sum +
                    Number(
                        game.visits || 0
                    )
                );
            },
            0
        );


    /*
        Round DOWN to nearest 10 million.

        201M -> 200M+
        208M -> 200M+
        218M -> 210M+
        229M -> 220M+
        287M -> 280M+
    */

    const roundedMillions =
        Math.floor(
            total /
            10_000_000
        ) * 10;


    setTextIfChanged(
        element,

        `${roundedMillions}M+`
    );
}


/* =========================================================
   THUMBNAILS
   ========================================================= */

async function fetchThumbnails() {
    const universeIds =
        games.map(
            game =>
                game.universeId
        );


    try {
        const response =
            await fetch(
                "https://thumbnails.roproxy.com/v1/games/" +
                "multiget/thumbnails" +
                `?universeIds=${universeIds.join(",")}` +
                "&countPerUniverse=1" +
                "&size=768x432" +
                "&format=Png" +
                "&isCircular=false"
            );


        if (!response.ok) {
            throw new Error(
                `Thumbnail request failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        data?.data?.forEach(
            (
                thumbnailInfo,
                index
            ) => {
                const game =
                    games[index];


                if (!game) {
                    return;
                }


                const element =
                    document.getElementById(
                        game.thumbnailElementId
                    );


                if (!element) {
                    return;
                }


                const url =
                    thumbnailInfo
                        ?.thumbnails
                        ?.[0]
                        ?.imageUrl;


                const nextSource =
                    url ||
                    game.backupThumbnailUrl;


                game.thumbnailUrl =
                    nextSource;


                /*
                    Don't reload the image if
                    the source didn't change.
                */

                const absoluteSource =
                    new URL(
                        nextSource,
                        document.baseURI
                    ).href;


                if (
                    element.src !==
                    absoluteSource
                ) {
                    element.src =
                        nextSource;
                }
            }
        );

    } catch (error) {
        console.error(
            "Could not load Roblox thumbnails:",
            error
        );


        games.forEach(
            game => {
                const element =
                    document.getElementById(
                        game.thumbnailElementId
                    );


                if (
                    element &&
                    !element.src
                ) {
                    element.src =
                        game.backupThumbnailUrl;
                }
            }
        );
    }
}


/* =========================================================
   FETCH ONE GAME
   ========================================================= */

async function updateGame(game) {
    try {
        const response =
            await fetch(
                "https://games.roproxy.com/v1/games" +
                `?universeIds=${game.universeId}`
            );


        if (!response.ok) {
            throw new Error(
                `Game request failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        const info =
            data?.data?.[0];


        if (!info) {
            return false;
        }


        const playing =
            Number(
                info.playing
            ) || 0;


        const visits =
            Number(
                info.visits
            ) || 0;


        game.playing =
            playing;

        game.visits =
            visits;


        /* =========================
           PLAYER COUNT
           ========================= */

        const onlineElement =
            document.getElementById(
                game.onlineCountElementId
            );


        updatePlayerNumber(
            onlineElement,
            playing,

            /*
                Animate first load only.
            */

            !initialStatsLoaded
        );


        /* =========================
           VISITS
           ========================= */

        const visitsElement =
            document.getElementById(
                game.visitCountElementId
            );


        setTextIfChanged(
            visitsElement,

            formatNumber(
                visits
            )
        );


        /* =========================
           SITE TOTALS
           ========================= */

        updateTotalPlayers();

        updateTotalGameVisits();


        return true;

    } catch (error) {
        console.error(
            `Could not update universe ${game.universeId}:`,
            error
        );


        return false;
    }
}


/* =========================================================
   UPDATE ALL GAMES
   ========================================================= */

async function updateAllGamesInfo() {
    const results =
        await Promise.allSettled(
            games.map(
                game =>
                    updateGame(
                        game
                    )
            )
        );


    updateTotalPlayers();

    updateTotalGameVisits();


    window.dispatchEvent(
        new CustomEvent(
            "gamesUpdated",
            {
                detail: {
                    games
                }
            }
        )
    );


    return results;
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializeRobloxInfo() {

    /*
        Initial Roblox stats and thumbnails
        load at the same time.
    */

    await Promise.allSettled([
        fetchThumbnails(),
        updateAllGamesInfo()
    ]);


    updateTotalPlayers();

    updateTotalGameVisits();


    initialStatsLoaded =
        true;


    /*
        main.js checks this before revealing
        the live player strip/game cards.
    */

    window.robloxInitialDataReady =
        true;


    window.dispatchEvent(
        new Event(
            "robloxInitialDataReady"
        )
    );


    /*
        Quiet background refresh.

        No ScrollReveal.
        No repeated Odometer.
    */

    setInterval(
        updateAllGamesInfo,
        30_000
    );
}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeRobloxInfo
    );
} else {
    initializeRobloxInfo();
}