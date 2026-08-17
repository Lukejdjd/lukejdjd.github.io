const GITHUB_USERNAME =
    "Lukejdjd";

const CONTRIBUTIONS_API =
    "https://github-contributions-api.jogruber.de/v4/" +
    encodeURIComponent(
        GITHUB_USERNAME
    );


/* =========================================================
   ELEMENTS
   ========================================================= */

const contributionCountElement =
    document.getElementById(
        "activityContributionCount"
    );

const contributionTextElement =
    document.getElementById(
        "activityContributionText"
    );

const contributionGraphElement =
    document.getElementById(
        "activityContributionGraph"
    );

const monthLabelsElement =
    document.getElementById(
        "activityMonthLabels"
    );

const rollingButton =
    document.getElementById(
        "activityRollingButton"
    );

const monthSelect =
    document.getElementById(
        "activityMonthSelect"
    );

const yearSelect =
    document.getElementById(
        "activityYearSelect"
    );


/* =========================================================
   STATE
   ========================================================= */

let contributionData = [];

let activityControlsBound =
    false;

let currentView =
    "rolling";


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getDateKey(date) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        `${year}-${month}-${day}`
    );
}


function parseDate(value) {
    const [
        year,
        month,
        day
    ] =
        value
            .split("-")
            .map(Number);

    return new Date(
        year,
        month - 1,
        day,
        12
    );
}


function getMonthName(month) {
    return new Date(
        2000,
        month,
        1
    ).toLocaleDateString(
        "en-US",
        {
            month: "long"
        }
    );
}


function getShortMonthName(month) {
    return new Date(
        2000,
        month,
        1
    ).toLocaleDateString(
        "en-US",
        {
            month: "short"
        }
    ).toUpperCase();
}


function formatDate(date) {
    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


/* =========================================================
   CONTRIBUTION LEVEL
   ========================================================= */

function getContributionLevel(
    count,
    suppliedLevel
) {
    const parsed =
        Number(
            suppliedLevel
        );

    if (
        Number.isFinite(parsed) &&
        parsed >= 0 &&
        parsed <= 4
    ) {
        return parsed;
    }

    if (count <= 0) {
        return 0;
    }

    if (count === 1) {
        return 1;
    }

    if (count <= 3) {
        return 2;
    }

    if (count <= 6) {
        return 3;
    }

    return 4;
}


/* =========================================================
   FETCH CONTRIBUTIONS
   ========================================================= */

async function fetchContributions() {
    const response =
        await fetch(
            CONTRIBUTIONS_API,
            {
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );

    if (!response.ok) {
        throw new Error(
            `Contribution request failed: ${response.status}`
        );
    }

    const data =
        await response.json();

    if (
        !Array.isArray(
            data?.contributions
        )
    ) {
        throw new Error(
            "No contribution data returned."
        );
    }

    return data.contributions;
}


/* =========================================================
   TOOLTIP
   ========================================================= */

function getTooltip() {
    let tooltip =
        document.querySelector(
            ".activity-tooltip"
        );

    if (tooltip) {
        return tooltip;
    }

    tooltip =
        document.createElement(
            "div"
        );

    tooltip.className =
        "activity-tooltip";

    document.body.appendChild(
        tooltip
    );

    return tooltip;
}


/* =========================================================
   CONTRIBUTION MAP
   ========================================================= */

function buildContributionMap() {
    const map =
        new Map();

    contributionData.forEach(
        contribution => {
            map.set(
                contribution.date,
                {
                    count:
                        Number(
                            contribution.count
                        ) || 0,

                    level:
                        Number(
                            contribution.level
                        )
                }
            );
        }
    );

    return map;
}


/* =========================================================
   AVAILABLE YEARS
   ========================================================= */

function getAvailableYears() {
    return Array.from(
        new Set(
            contributionData.map(
                contribution =>
                    parseDate(
                        contribution.date
                    ).getFullYear()
            )
        )
    ).sort(
        (a, b) =>
            b - a
    );
}


/* =========================================================
   SELECTORS
   ========================================================= */

function populateSelectors() {
    if (
        !monthSelect ||
        !yearSelect
    ) {
        return;
    }


    /* =========================
       MONTHS
       ========================= */

    monthSelect.replaceChildren();

    for (
        let month = 0;
        month < 12;
        month++
    ) {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            String(month);

        option.textContent =
            getMonthName(
                month
            );

        monthSelect.appendChild(
            option
        );
    }


    /* =========================
       YEARS
       ========================= */

    yearSelect.replaceChildren();

    const years =
        getAvailableYears();

    years.forEach(
        year => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(year);

            option.textContent =
                String(year);

            yearSelect.appendChild(
                option
            );
        }
    );


    /* =========================
       DEFAULT VALUES
       ========================= */

    const today =
        new Date();

    monthSelect.value =
        String(
            today.getMonth()
        );

    if (
        years.includes(
            today.getFullYear()
        )
    ) {
        yearSelect.value =
            String(
                today.getFullYear()
            );
    } else if (
        years.length > 0
    ) {
        yearSelect.value =
            String(
                years[0]
            );
    }
}


/* =========================================================
   HEADLINE
   ========================================================= */

function updateHeadline(
    count,
    suffix
) {
    const formatted =
        Number(count)
            .toLocaleString(
                "en-US"
            );

    const text =
        `${formatted} contributions ${suffix}`;


    /*
       Update the original number element if
       it still exists.
    */

    if (
        contributionCountElement &&
        contributionCountElement
            .textContent
            .trim() !== formatted
    ) {
        contributionCountElement
            .textContent =
                formatted;
    }


    /*
       Do not repeatedly rewrite the Activity
       headline if it already says the same thing.
    */

    if (
        contributionTextElement
    ) {
        const current =
            contributionTextElement
                .textContent
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

        if (
            current !== text
        ) {
            contributionTextElement
                .textContent =
                    text;
        }
    }
}


/* =========================================================
   DAY CELL
   ========================================================= */

function createContributionCell(
    date,
    contribution,
    options = {}
) {
    const {
        future = false,
        faded = false
    } = options;


    const count =
        future
            ? 0
            : Number(
                contribution?.count
            ) || 0;


    const level =
        future
            ? 0
            : getContributionLevel(
                count,
                contribution?.level
            );


    const cell =
        document.createElement(
            "span"
        );


    cell.className =
        "activity-calendar__day " +
        `activity-calendar__day--${level}`;


    if (future) {
        cell.classList.add(
            "activity-calendar__day--future"
        );
    }


    if (faded) {
        cell.style.opacity =
            "0.18";
    }


    cell.dataset.date =
        getDateKey(
            date
        );

    cell.dataset.count =
        String(
            count
        );


    /* =========================
       TOOLTIP
       ========================= */

    const tooltip =
        getTooltip();


    cell.addEventListener(
        "mouseenter",
        () => {
            tooltip.textContent =
                `${count} contribution${
                    count === 1
                        ? ""
                        : "s"
                } · ${formatDate(date)}`;

            tooltip.classList.add(
                "is-visible"
            );
        }
    );


    cell.addEventListener(
        "mousemove",
        event => {
            tooltip.style.left =
                `${event.clientX + 12}px`;

            tooltip.style.top =
                `${event.clientY + 12}px`;
        }
    );


    cell.addEventListener(
        "mouseleave",
        () => {
            tooltip.classList.remove(
                "is-visible"
            );
        }
    );


    return {
        cell,
        count
    };
}


/* =========================================================
   ROLLING MONTH LABELS
   ========================================================= */

function renderRollingMonthLabels(
    visualStart,
    totalWeeks
) {
    if (!monthLabelsElement) {
        return;
    }

    const fragment =
        document.createDocumentFragment();

    let previousMonth =
        -1;


    for (
        let week = 0;
        week < totalWeeks;
        week++
    ) {
        const date =
            new Date(
                visualStart
            );

        date.setDate(
            visualStart.getDate() +
            week * 7
        );


        const month =
            date.getMonth();


        if (
            month ===
            previousMonth
        ) {
            continue;
        }


        if (
            week === 0 &&
            date.getDate() > 20
        ) {
            previousMonth =
                month;

            continue;
        }


        const label =
            document.createElement(
                "span"
            );

        label.className =
            "activity-calendar__month";


        label.textContent =
            getShortMonthName(
                month
            );


        label.style.left =
            `${
                (
                    week /
                    totalWeeks
                ) * 100
            }%`;


        fragment.appendChild(
            label
        );

        previousMonth =
            month;
    }


    monthLabelsElement
        .replaceChildren(
            fragment
        );
}


/* =========================================================
   YEAR MONTH LABELS
   ========================================================= */

function renderYearMonthLabels(
    visualStart,
    totalWeeks,
    year
) {
    if (!monthLabelsElement) {
        return;
    }


    const fragment =
        document.createDocumentFragment();


    for (
        let month = 0;
        month < 12;
        month++
    ) {
        const firstDay =
            new Date(
                year,
                month,
                1,
                12
            );


        const daysFromStart =
            Math.round(
                (
                    firstDay -
                    visualStart
                ) /
                86_400_000
            );


        const weekIndex =
            Math.floor(
                daysFromStart /
                7
            );


        const label =
            document.createElement(
                "span"
            );


        label.className =
            "activity-calendar__month";


        label.textContent =
            getShortMonthName(
                month
            );


        label.style.left =
            `${
                (
                    weekIndex /
                    totalWeeks
                ) * 100
            }%`;


        fragment.appendChild(
            label
        );
    }


    monthLabelsElement
        .replaceChildren(
            fragment
        );
}


/* =========================================================
   SINGLE MONTH LABEL
   ========================================================= */

function renderMonthViewLabel(
    month,
    year
) {
    if (!monthLabelsElement) {
        return;
    }


    const label =
        document.createElement(
            "span"
        );


    label.className =
        "activity-calendar__month";


    label.style.left =
        "0%";


    label.textContent =
        `${getShortMonthName(month)} ${year}`;


    monthLabelsElement
        .replaceChildren(
            label
        );
}


/* =========================================================
   LAST 12 MONTHS
   ========================================================= */

function renderRollingYear() {
    if (
        !contributionGraphElement
    ) {
        return;
    }


    currentView =
        "rolling";


    rollingButton?.classList.add(
        "is-active"
    );


    const today =
        new Date();


    today.setHours(
        12,
        0,
        0,
        0
    );


    const yearStart =
        new Date(
            today
        );


    yearStart.setDate(
        yearStart.getDate() -
        364
    );


    /*
       Align the visual graph to Sunday.
    */

    const visualStart =
        new Date(
            yearStart
        );


    visualStart.setDate(
        visualStart.getDate() -
        visualStart.getDay()
    );


    const dayDifference =
        Math.floor(
            (
                today -
                visualStart
            ) /
            86_400_000
        );


    const totalWeeks =
        Math.ceil(
            (
                dayDifference + 1
            ) /
            7
        );


    const map =
        buildContributionMap();


    const fragment =
        document.createDocumentFragment();


    let total =
        0;


    for (
        let week = 0;
        week < totalWeeks;
        week++
    ) {
        for (
            let day = 0;
            day < 7;
            day++
        ) {
            const date =
                new Date(
                    visualStart
                );


            date.setDate(
                visualStart.getDate() +
                week * 7 +
                day
            );


            const result =
                createContributionCell(
                    date,

                    map.get(
                        getDateKey(
                            date
                        )
                    ),

                    {
                        future:
                            date > today
                    }
                );


            if (
                date >= yearStart &&
                date <= today
            ) {
                total +=
                    result.count;
            }


            fragment.appendChild(
                result.cell
            );
        }
    }


    contributionGraphElement
        .className =
            "activity-calendar__graph";


    contributionGraphElement
        .style
        .gridTemplateColumns =
            `repeat(${totalWeeks}, minmax(10px, 1fr))`;


    contributionGraphElement
        .replaceChildren(
            fragment
        );


    updateHeadline(
        total,
        "in the last year"
    );


    renderRollingMonthLabels(
        visualStart,
        totalWeeks
    );
}


/* =========================================================
   FULL CALENDAR YEAR
   ========================================================= */

function renderSelectedYear(
    selectedYear = null
) {
    if (
        !contributionGraphElement ||
        !yearSelect
    ) {
        return;
    }


    currentView =
        "year";


    rollingButton?.classList.remove(
        "is-active"
    );


    const year =
        selectedYear !== null
            ? Number(
                selectedYear
            )
            : Number(
                yearSelect.value
            );


    /*
       Jan 1 → Dec 31
    */

    const firstDay =
        new Date(
            year,
            0,
            1,
            12
        );


    const lastDay =
        new Date(
            year,
            11,
            31,
            12
        );


    /*
       Start graph on Sunday before Jan 1.
    */

    const visualStart =
        new Date(
            firstDay
        );


    visualStart.setDate(
        visualStart.getDate() -
        visualStart.getDay()
    );


    /*
       End graph on Saturday after Dec 31.
    */

    const visualEnd =
        new Date(
            lastDay
        );


    visualEnd.setDate(
        visualEnd.getDate() +
        (
            6 -
            visualEnd.getDay()
        )
    );


    const dayDifference =
        Math.round(
            (
                visualEnd -
                visualStart
            ) /
            86_400_000
        );


    const totalWeeks =
        Math.ceil(
            (
                dayDifference + 1
            ) /
            7
        );


    const map =
        buildContributionMap();


    const fragment =
        document.createDocumentFragment();


    const today =
        new Date();


    today.setHours(
        12,
        0,
        0,
        0
    );


    let total =
        0;


    for (
        let week = 0;
        week < totalWeeks;
        week++
    ) {
        for (
            let day = 0;
            day < 7;
            day++
        ) {
            const date =
                new Date(
                    visualStart
                );


            date.setDate(
                visualStart.getDate() +
                week * 7 +
                day
            );


            const insideYear =
                date.getFullYear() ===
                year;


            const future =
                date > today;


            const result =
                createContributionCell(
                    date,

                    map.get(
                        getDateKey(
                            date
                        )
                    ),

                    {
                        future,

                        faded:
                            !insideYear
                    }
                );


            if (
                insideYear &&
                !future
            ) {
                total +=
                    result.count;
            }


            fragment.appendChild(
                result.cell
            );
        }
    }


    contributionGraphElement
        .className =
            "activity-calendar__graph";


    contributionGraphElement
        .style
        .gridTemplateColumns =
            `repeat(${totalWeeks}, minmax(10px, 1fr))`;


    contributionGraphElement
        .replaceChildren(
            fragment
        );


    updateHeadline(
        total,
        `in ${year}`
    );


    renderYearMonthLabels(
        visualStart,
        totalWeeks,
        year
    );
}


/* =========================================================
   SPECIFIC MONTH
   ========================================================= */

function renderSelectedMonth() {
    if (
        !monthSelect ||
        !yearSelect ||
        !contributionGraphElement
    ) {
        return;
    }


    currentView =
        "month";


    rollingButton?.classList.remove(
        "is-active"
    );


    const month =
        Number(
            monthSelect.value
        );


    const year =
        Number(
            yearSelect.value
        );


    const firstDay =
        new Date(
            year,
            month,
            1,
            12
        );


    const lastDay =
        new Date(
            year,
            month + 1,
            0,
            12
        );


    const visualStart =
        new Date(
            firstDay
        );


    visualStart.setDate(
        visualStart.getDate() -
        visualStart.getDay()
    );


    const visualEnd =
        new Date(
            lastDay
        );


    visualEnd.setDate(
        visualEnd.getDate() +
        (
            6 -
            visualEnd.getDay()
        )
    );


    const dayDifference =
        Math.round(
            (
                visualEnd -
                visualStart
            ) /
            86_400_000
        );


    const totalWeeks =
        Math.ceil(
            (
                dayDifference + 1
            ) /
            7
        );


    const today =
        new Date();


    today.setHours(
        12,
        0,
        0,
        0
    );


    const map =
        buildContributionMap();


    const fragment =
        document.createDocumentFragment();


    let total =
        0;


    for (
        let week = 0;
        week < totalWeeks;
        week++
    ) {
        for (
            let day = 0;
            day < 7;
            day++
        ) {
            const date =
                new Date(
                    visualStart
                );


            date.setDate(
                visualStart.getDate() +
                week * 7 +
                day
            );


            const insideMonth =
                date.getFullYear() ===
                    year &&
                date.getMonth() ===
                    month;


            const future =
                date > today;


            const result =
                createContributionCell(
                    date,

                    map.get(
                        getDateKey(
                            date
                        )
                    ),

                    {
                        future,

                        faded:
                            !insideMonth
                    }
                );


            if (
                insideMonth &&
                !future
            ) {
                total +=
                    result.count;
            }


            fragment.appendChild(
                result.cell
            );
        }
    }


    contributionGraphElement
        .className =
            "activity-calendar__graph";


    contributionGraphElement
        .style
        .gridTemplateColumns =
            `repeat(${totalWeeks}, minmax(10px, 1fr))`;


    contributionGraphElement
        .replaceChildren(
            fragment
        );


    updateHeadline(
        total,

        `in ${
            getMonthName(
                month
            )
        } ${year}`
    );


    renderMonthViewLabel(
        month,
        year
    );
}


/* =========================================================
   CONTROLS
   ========================================================= */

function setupControls() {
    if (
        activityControlsBound
    ) {
        return;
    }


    activityControlsBound =
        true;


    /* =========================
       LAST 12 MONTHS
       ========================= */

    rollingButton?.addEventListener(
        "click",
        () => {
            renderRollingYear();
        }
    );


    /* =========================
       YEAR

       Selecting 2026 / 2025 / 2024
       now shows the WHOLE year.
       ========================= */

    yearSelect?.addEventListener(
        "change",
        () => {
            renderSelectedYear();
        }
    );


    /* =========================
       MONTH

       Changing the month drills down
       into the selected year.
       ========================= */

    monthSelect?.addEventListener(
        "change",
        () => {
            renderSelectedMonth();
        }
    );
}


/* =========================================================
   ACTIVITY READY
   ========================================================= */

function markActivityReady() {
    window.githubActivityReady =
        true;


    window.dispatchEvent(
        new Event(
            "githubActivityReady"
        )
    );
}


/* =========================================================
   INITIAL LOAD
   ========================================================= */

async function loadActivity() {
    try {
        /*
           Fetch complete history once.

           Switching years/months afterward
           is instant because no additional
           API request is needed.
        */

        contributionData =
            await fetchContributions();


        populateSelectors();

        setupControls();


        /*
           Default:
           rolling Last 12 Months.
        */

        renderRollingYear();

    } catch (error) {
        console.error(
            "Could not load GitHub contributions:",
            error
        );


        if (
            contributionGraphElement
        ) {
            contributionGraphElement
                .textContent =
                    "Contribution activity is unavailable right now.";
        }

    } finally {
        markActivityReady();
    }
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
        loadActivity
    );
} else {
    loadActivity();
}