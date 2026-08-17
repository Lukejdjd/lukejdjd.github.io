/* =========================================================
   THEME
   ========================================================= */

const themeButton = document.getElementById("theme-button");

const darkTheme = "dark-theme";
const iconTheme = "ri-sun-line";

const selectedTheme = localStorage.getItem("selected-theme");

const systemTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
);

const getCurrentTheme = () =>
    document.body.classList.contains(darkTheme)
        ? "dark"
        : "light";


function applyTheme(theme) {
    const isDark =
        theme === "dark";

    document.body.classList.toggle(
        darkTheme,
        isDark
    );

    if (themeButton) {
        themeButton.classList.toggle(
            iconTheme,
            isDark
        );
    }
}


/*
   If the user already chose a theme,
   use that saved choice.

   Otherwise follow their system theme.
*/

if (selectedTheme) {
    applyTheme(selectedTheme);
} else {
    applyTheme(
        systemTheme.matches
            ? "dark"
            : "light"
    );
}


/*
   If no manual theme has been selected,
   automatically follow system changes.
*/

systemTheme.addEventListener(
    "change",
    event => {
        if (
            localStorage.getItem(
                "selected-theme"
            )
        ) {
            return;
        }

        applyTheme(
            event.matches
                ? "dark"
                : "light"
        );
    }
);


/*
   Manual theme toggle.

   Once clicked, the user's choice
   overrides the system theme.
*/

themeButton?.addEventListener(
    "click",
    () => {
        const nextTheme =
            getCurrentTheme() === "dark"
                ? "light"
                : "dark";

        applyTheme(nextTheme);

        localStorage.setItem(
            "selected-theme",
            nextTheme
        );
    }
);


/* =========================================================
   STATIC COUNTERS
   ========================================================= */

function updateCompletedProjectsCount() {
    const projectsContainer =
        document.querySelector(
            "#work .projects__content"
        );

    const countElement =
        document.getElementById(
            "completedProjectsCount"
        );

    if (!projectsContainer || !countElement) {
        return;
    }

    const cards =
        projectsContainer.querySelectorAll(
            ".projects__card"
        );

    countElement.textContent =
        cards.length.toLocaleString(
            "en-US"
        );
}


function updateYearsOfWork() {
    const element =
        document.getElementById(
            "yearsOfWork"
        );

    if (!element) {
        return;
    }

    const startingYear = 2020;

    element.textContent =
        new Date().getFullYear() -
        startingYear;
}


updateCompletedProjectsCount();
updateYearsOfWork();


/* =========================================================
   SCROLL RESTORATION
   ========================================================= */

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

const initialHash =
    window.location.hash;


/* =========================================================
   HEADER HEIGHT
   ========================================================= */

function getHeaderHeight() {
    const header =
        document.querySelector(
            ".site-header"
        );

    return header
        ? header.offsetHeight
        : 0;
}


/* =========================================================
   INITIAL SECTION HASH
   ========================================================= */

/*
   The homepage itself no longer uses #top.

   This only handles real section URLs such as:
   #work
   #activity
   #projects-public
   #skills
*/

function positionInitialHash() {
    if (!initialHash) {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });

        return;
    }

    let target;

    try {
        target =
            document.querySelector(
                initialHash
            );
    } catch {
        return;
    }

    if (!target) {
        return;
    }

    const headerHeight =
        getHeaderHeight();

    const targetTop =
        target.getBoundingClientRect().top +
        window.scrollY;

    const finalPosition =
        targetTop -
        headerHeight -
        18;

    window.scrollTo({
        top: Math.max(
            0,
            finalPosition
        ),

        left: 0,

        behavior: "instant"
    });
}


window.addEventListener(
    "load",
    () => {
        requestAnimationFrame(() => {
            positionInitialHash();
        });
    },
    {
        once: true
    }
);


/* =========================================================
   SECTION NAVIGATION
   ========================================================= */

document
    .querySelectorAll(
        'a[href="#work"], ' +
        'a[href="#activity"], ' +
        'a[href="#projects-public"], ' +
        'a[href="#skills"]'
    )
    .forEach(link => {
        link.addEventListener(
            "click",
            event => {
                const hash =
                    link.getAttribute(
                        "href"
                    );

                if (!hash) {
                    return;
                }

                const target =
                    document.querySelector(
                        hash
                    );

                if (!target) {
                    return;
                }

                event.preventDefault();

                history.pushState(
                    null,
                    "",
                    hash
                );

                const headerHeight =
                    getHeaderHeight();

                const targetTop =
                    target
                        .getBoundingClientRect()
                        .top +
                    window.scrollY;

                const finalPosition =
                    targetTop -
                    headerHeight -
                    18;

                window.scrollTo({
                    top: Math.max(
                        0,
                        finalPosition
                    ),

                    left: 0,

                    behavior: "smooth"
                });
            }
        );
    });


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

if (typeof ScrollReveal !== "undefined") {

    /*
       Faster scroll reveals while keeping
       the hero entrance slightly more staged.
    */

    const pageLoadedWithHash =
        initialHash.length > 0;

    const sr =
        ScrollReveal({
            origin: "top",
            distance: "32px",
            duration: 700,
            delay: 0,
            opacity: 0,
            scale: 1,

            easing:
                "cubic-bezier(0.22, 1, 0.36, 1)",

            reset: false,
            viewFactor: 0.05
        });


    function isElementVisible(element) {
        const rect =
            element.getBoundingClientRect();

        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0
        );
    }


    function revealOnce(
        target,
        options = {}
    ) {
        const elements =
            document.querySelectorAll(
                target
            );

        elements.forEach(element => {

            /*
               On a direct section refresh, don't make
               something already on-screen jump again.
            */

            if (
                pageLoadedWithHash &&
                isElementVisible(element)
            ) {
                return;
            }

            sr.reveal(
                element,
                {
                    ...options,

                    reset: false,

                    afterReveal(
                        revealedElement
                    ) {
                        sr.clean(
                            revealedElement
                        );
                    }
                }
            );
        });
    }


    /* =====================================================
       HERO
       ===================================================== */

    /*
       Keep the page-load hero animation
       slightly more staged than scroll content.
    */

    /* 1 — AVATAR */

    revealOnce(
        ".profile__border",
        {
            delay: 120,
            duration: 850
        }
    );


    /* 2 — DEVELOPER / GAME CREATOR */

    revealOnce(
        ".eyebrow",
        {
            delay: 180,
            duration: 850
        }
    );


    /* 3 — LUKE + VERIFIED */

    revealOnce(
        ".profile__name-row",
        {
            delay: 240,
            duration: 850
        }
    );


    /* 4 — USERNAME */

    revealOnce(
        ".profile__username",
        {
            delay: 300,
            duration: 850
        }
    );


    /* 5 — DESCRIPTION */

    revealOnce(
        ".profile__profession",
        {
            delay: 360,
            duration: 850
        }
    );


    /* 6 — SOCIAL ICONS */

    revealOnce(
        ".profile__social",
        {
            delay: 420,
            duration: 850
        }
    );


    /* 7 — BUTTONS */

    revealOnce(
        ".profile__buttons",
        {
            delay: 480,
            duration: 850
        }
    );


    /* 8 — STATS */

    revealOnce(
        ".profile__info-group",
        {
            interval: 80,
            delay: 540,
            duration: 850
        }
    );


    /* =====================================================
       FEATURED WORK
       ===================================================== */

    revealOnce(
        "#work .section__heading",
        {
            delay: 60
        }
    );


    /* =====================================================
       ROBLOX DATA
       ===================================================== */

    function revealRobloxContent() {
        if (revealRobloxContent.done) {
            return;
        }

        revealRobloxContent.done = true;


        /* LIVE PLAYER COUNT */

        revealOnce(
            "#work .live-player-strip",
            {
                delay: 100
            }
        );


        /* FEATURED GAME CARDS */

        revealOnce(
            "#work .projects__card",
            {
                interval: 90,
                delay: 140
            }
        );
    }


    if (
        window.robloxInitialDataReady ===
        true
    ) {
        revealRobloxContent();

    } else {

        window.addEventListener(
            "robloxInitialDataReady",
            revealRobloxContent,
            {
                once: true
            }
        );


        /*
           Failsafe if Roblox data takes too long
           or the API doesn't respond.
        */

        setTimeout(
            revealRobloxContent,
            3000
        );
    }


    /* =====================================================
       ACTIVITY
       ===================================================== */

    revealOnce(
        "#activity .section__heading",
        {
            delay: 60
        }
    );


    function revealActivityContent() {
        if (
            revealActivityContent.done
        ) {
            return;
        }

        revealActivityContent.done = true;


        revealOnce(
            "#activity .activity-card",
            {
                delay: 120
            }
        );
    }


    if (
        window.githubActivityReady ===
        true
    ) {
        revealActivityContent();

    } else {

        window.addEventListener(
            "githubActivityReady",
            revealActivityContent,
            {
                once: true
            }
        );


        /*
           GitHub API failsafe.
        */

        setTimeout(
            revealActivityContent,
            3500
        );
    }


    /* =====================================================
       PUBLIC PROJECTS
       ===================================================== */

    revealOnce(
        "#projects-public .section__heading",
        {
            delay: 60
        }
    );


    revealOnce(
        "#projects-public .repo-row",
        {
            interval: 70,
            delay: 100
        }
    );


    /* =====================================================
       SKILLS
       ===================================================== */

    revealOnce(
        "#skills .section__heading",
        {
            delay: 60
        }
    );


    revealOnce(
        "#skills .skills__area",
        {
            interval: 80,
            delay: 100
        }
    );


    /* =====================================================
       QUOTE
       ===================================================== */

    revealOnce(
        ".quote-strip",
        {
            delay: 60
        }
    );


    /* =====================================================
       FOOTER
       ===================================================== */

    revealOnce(
        ".footer",
        {
            delay: 80
        }
    );
}