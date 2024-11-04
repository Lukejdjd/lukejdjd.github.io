const games = [
    {
        placeId: 6229116934,
        cardId: "hoopzCard",
        onlineCountElementId: "hoopzOnlineCount",
        visitCountElementId: "hoopzVisitCount",
        playing: 0,
        visits: 0,
    },
    {
        placeId: 15564827526,
        cardId: "blockPuzzleCard",
        onlineCountElementId: "blockPuzzleOnlineCount",
        visitCountElementId: "blockPuzzleVisitCount",
        playing: 0,
        visits: 0,
    },
    {
        placeId: 14878098948,
        cardId: "ugcDontTalkCard",
        onlineCountElementId: "ugcDontTalkOnlineCount",
        visitCountElementId: "ugcDontTalkVisitCount",
        playing: 0,
        visits: 0,
    },
    {
        placeId: 13615287854,
        cardId: "climbingGameCard",
        onlineCountElementId: "climbingGameOnlineCount",
        visitCountElementId: "climbingGameVisitCount",
        playing: 0,
        visits: 0,
    }
];


// Expose the games variable to the window object
window.games = games;

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

// Define a custom event name
const gamesUpdatedEvent = new Event('gamesUpdated');

async function getUniverseInfo(placeId, onlineCountElement, visitCountElement, cachedData) {
    try {
        let responseData;
        if (cachedData) {
            responseData = cachedData;
        } else {
            const universeResponse = await fetch(`https://apis.roproxy.com/universes/v1/places/${placeId}/universe`);
            if (!universeResponse.ok) {
                throw new Error(`[${universeResponse.status}] An error occurred while converting placeId to universeId | placeId: ${placeId}`);
            }

            const { universeId } = await universeResponse.json();

            const gamesResponse = await fetch(`https://games.roproxy.com/v1/games?universeIds=${universeId}`);
            if (!gamesResponse.ok) {
                throw new Error(`[${gamesResponse.status}] An error occurred with getUniverseInfo() | universeId: ${universeId}`);
            }

            responseData = await gamesResponse.json();
        }

        if (responseData && responseData.data.length > 0) {
            const { playing, visits } = responseData.data[0];
            animateOdometer(playing, onlineCountElement);
            visitCountElement.textContent = formatNumber(visits);

            // Update the game data
            const gameIndex = games.findIndex(game => game.placeId === placeId);
            if (gameIndex !== -1) {
                games[gameIndex].playing = playing;
                games[gameIndex].visits = visits;

                // Dispatch the event after updating the games array
                window.dispatchEvent(gamesUpdatedEvent);
            }

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

const debouncedUpdateAllGamesInfo = (func, delay) => {
    let timeoutId;
    return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(), delay);
    };
};

const debouncedUpdate = debouncedUpdateAllGamesInfo(updateAllGamesInfo, 5000);

document.addEventListener("DOMContentLoaded", () => {
    debouncedUpdate();
    setInterval(debouncedUpdate, 5000);
});
