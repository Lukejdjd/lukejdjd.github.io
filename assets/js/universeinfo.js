const games = [
    {
        placeId: 6229116934,
        onlineCountElementId: "hoopzOnlineCount",
        visitCountElementId: "hoopzVisitCount",
    },
    {
        placeId: 15564827526,
        onlineCountElementId: "blockPuzzleOnlineCount",
        visitCountElementId: "blockPuzzleVisitCount",
    },
    {
        placeId: 14878098948,
        onlineCountElementId: "ugcDontTalkOnlineCount",
        visitCountElementId: "ugcDontTalkVisitCount",
    },
    {
        placeId: 13615287854,
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

    return number.toLocaleString("en-US", { maximumFractionDigits: 1 }) + suffixes[suffixIndex];
}

function hasSuffix(text) {
    const suffixes = ["K", "M", "B", "T"];
    return suffixes.some((suffix) => text.includes(suffix));
}

async function getUniverseInfo(placeId, onlineCountElement, visitCountElement) {
    try {
        const universeResponse = await fetch(`https://apis.roproxy.com/universes/v1/places/${placeId}/universe`);
        if (!universeResponse.ok) {
            throw new Error(`[${universeResponse.status}] An error occurred while converting placeId to universeId | placeId: ${placeId}`);
        }

        const { universeId } = await universeResponse.json();

        const gamesResponse = await fetch(`https://games.roproxy.com/v1/games?universeIds=${universeId}`);
        if (!gamesResponse.ok) {
            throw new Error(`[${gamesResponse.status}] An error occurred with getUniverseInfo() | universeId: ${universeId}`);
        }

        const { data } = await gamesResponse.json();

        if (data.length > 0) {
            const { playing, visits } = data[0];
            animateOdometer(playing, onlineCountElement);

            visitCountElement.textContent = formatNumber(visits);

            if (!hasSuffix(visitCountElement.textContent)) {
                animateOdometer(visits, visitCountElement);
            }
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
    games.forEach(async ({ placeId, onlineCountElementId, visitCountElementId }) => {
        const onlineCountElement = document.getElementById(onlineCountElementId);
        const visitCountElement = document.getElementById(visitCountElementId);

        await getUniverseInfo(placeId, onlineCountElement, visitCountElement);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    updateAllGamesInfo();
    setInterval(updateAllGamesInfo, 5000);
});
