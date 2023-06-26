const games = [
    {
        universeId: 2287245386,
        onlineCountElementId: "hoopzOnlineCount",
        visitCountElementId: "hoopzVisitCount",
    },
    {
        universeId: 4728255385,
        onlineCountElementId: "climbingGameOnlineCount",
        visitCountElementId: "climbingGameVisitCount",
    }
];

function formatNumber(number) {
    const suffixes = ["", "K", "M", "B", "T"];
    let suffixIndex = 0;

    while (number >= 1000 && suffixIndex < suffixes.length - 1) {
        number /= 1000;
        suffixIndex++;
    }

    return number.toLocaleString("en-US", { maximumFractionDigits: 1 }) + suffixes[suffixIndex] + " Plays";
}

async function updateUniverseInfo(universeId, onlineCountElement, visitCountElement) {
    try {
        const url = `https://games.roproxy.com/v1/games?universeIds=${universeId}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.status === 200) {
            const { playing, visits } = data.data[0];

            animateOdometer(playing, onlineCountElement);
            visitCountElement.textContent = formatNumber(visits);
        } else {
            throw new Error(`[${response.status}] An error occurred with getUniverseInfo() | universeId: ${universeId}`);
        }
    } catch (error) {
        console.error(`Error fetching universe information: ${error.message}`);
    }
}

function animateOdometer(targetNumber, element) {
    const od = new Odometer({
        el: element,
        value: 0,
        duration: 2000,
    });

    od.update(targetNumber);
}

function updateAllGamesInfo() {
    games.forEach(async ({ universeId, onlineCountElementId, visitCountElementId }) => {
        const onlineCountElement = document.getElementById(onlineCountElementId);
        const visitCountElement = document.getElementById(visitCountElementId);

        await updateUniverseInfo(universeId, onlineCountElement, visitCountElement);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    updateAllGamesInfo();
    setInterval(updateAllGamesInfo, 3000);
});
