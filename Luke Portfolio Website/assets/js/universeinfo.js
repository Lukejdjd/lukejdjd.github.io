async function getUniverseInfo(placeId) {
    try {
        const universeResponse = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
        if (!universeResponse.ok) {
            throw new Error(`[${universeResponse.status}] An error occurred while converting placeId to universeId | placeId: ${placeId}`);
        }

        const { universeId } = await universeResponse.json();

        const gamesResponse = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
        if (!gamesResponse.ok) {
            throw new Error(`[${gamesResponse.status}] An error occurred with getUniverseInfo() | universeId: ${universeId}`);
        }

        const { data } = await gamesResponse.json();

        return data.map((universe) => {
            universe.created = new Date(universe.created);
            universe.updated = new Date(universe.updated);
            return universe;
        });
    } catch (error) {
        throw new Error(`Error fetching universe information: ${error.message}`);
    }
}

function formatNumber(number) {
    const trillion = 1e12;
    const billion = 1e9;
    const million = 1e6;

    if (number >= trillion) {
        return (number / trillion).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "T Plays";
    } else if (number >= billion) {
        return (number / billion).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "B Plays";
    } else if (number >= million) {
        return (number / million).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "M Plays";
    } else {
        return number.toLocaleString() + " Plays";
    }
}

function updateUniverseInfo(placeId, onlineCountElement, visitCountElement) {
    getUniverseInfo(placeId)
        .then((data) => {
            // Extract playing and visits values
            const { playing, visits } = data[0];

            // Format playing value
            const formattedPlaying = playing.toLocaleString() + " Online";

            // Format visits value
            const formattedVisits = formatNumber(visits);

            // Update the HTML elements with the counts
            onlineCountElement.textContent = formattedPlaying;
            visitCountElement.textContent = formattedVisits;

            console.log(`Updated universe information for placeId: ${placeId}`);
        })
        .catch((error) => {
            console.error(error);
        });
}

// Define the place IDs and corresponding element IDs
const games = [
    { placeId: 6229116934, onlineCountElementId: "hoopzOnlineCount", visitCountElementId: "hoopzVisitCount" },
    { placeId: 13615287854, onlineCountElementId: "climbingGameOnlineCount", visitCountElementId: "climbingGameVisitCount" },
];

// Function to update game information for all games
function updateAllGamesInfo() {
    games.forEach(({ placeId, onlineCountElementId, visitCountElementId }) => {
        const onlineCountElement = document.getElementById(onlineCountElementId);
        const visitCountElement = document.getElementById(visitCountElementId);
        updateUniverseInfo(placeId, onlineCountElement, visitCountElement);
    });
}

// Call the function initially for all games
updateAllGamesInfo();

// Set the interval to execute the function every 5 seconds for all games
setInterval(() => {
    updateAllGamesInfo();
    console.log('Updated all games information');
}, 5000);