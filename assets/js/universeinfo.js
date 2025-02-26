const games = [
    {
        placeId: 6229116934,
        universeId: 2287245386,
        cardId: "hoopzCard",
        onlineCountElementId: "hoopzOnlineCount",
        visitCountElementId: "hoopzVisitCount",
        thumbnailElementId: "hoopzThumbnail",
        playing: 0,
        visits: 0,
        thumbnailUrl: "",
        backupThumbnailUrl: "assets/hoopz.png",
    },
    {
        placeId: 15564827526,
        universeId: 5372679817,
        cardId: "blockPuzzleCard",
        onlineCountElementId: "blockPuzzleOnlineCount",
        visitCountElementId: "blockPuzzleVisitCount",
        thumbnailElementId: "blockPuzzleThumbnail",
        playing: 0,
        visits: 0,
        thumbnailUrl: "",
        backupThumbnailUrl: "assets/blockpuzle.png",
    },
    {
        placeId: 14878098948,
        universeId: 5126127183,
        cardId: "ugcDontTalkCard",
        onlineCountElementId: "ugcDontTalkOnlineCount",
        visitCountElementId: "ugcDontTalkVisitCount",
        thumbnailElementId: "ugcDontTalkThumbnail",
        playing: 0,
        visits: 0,
        thumbnailUrl: "",
        backupThumbnailUrl: "assets/ugcDontTalk.png",
    },
    {
        placeId: 13615287854,
        universeId: 4728255385,
        cardId: "climbingGameCard",
        onlineCountElementId: "climbingGameOnlineCount",
        visitCountElementId: "climbingGameVisitCount",
        thumbnailElementId: "climbingGameThumbnail",
        playing: 0,
        visits: 0,
        thumbnailUrl: "",
        backupThumbnailUrl: "assets/theclimbinggame.png",
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

// Define a custom event name
const gamesUpdatedEvent = new Event('gamesUpdated');

async function fetchThumbnails() {
    const universeIds = games.map(game => game.universeId);
    try {
        const response = await fetch(`https://thumbnails.roproxy.com/v1/games/multiget/thumbnails?universeIds=${universeIds.join(',')}&countPerUniverse=1&size=768x432&format=Png&isCircular=false`);
        
        if (!response.ok) {
            throw new Error(`[${response.status}] Error fetching thumbnails`);
        }

        const data = await response.json();
        if (data && data.data.length > 0) {
            data.data.forEach((thumbnailInfo, index) => {
                const universeId = universeIds[index];
                const game = games[index];
                const thumbnailElement = document.getElementById(game.thumbnailElementId);

                if (thumbnailInfo.thumbnails && thumbnailInfo.thumbnails.length > 0) {
                    const thumbnailUrl = thumbnailInfo.thumbnails[0].imageUrl;
                    game.thumbnailUrl = thumbnailUrl;
                    thumbnailElement.src = thumbnailUrl;
                } else {
                    thumbnailElement.src = game.backupThumbnailUrl;
                }
            });
        }
    } catch (error) {
        console.error(`Error fetching thumbnails: ${error.message}`);
    }
}

async function getUniverseInfo(universeId, onlineCountElement, visitCountElement, thumbnailElement, game) {
    try {
        const gamesResponse = await fetch(`https://games.roproxy.com/v1/games?universeIds=${universeId}`);
        if (!gamesResponse.ok) {
            throw new Error(`[${gamesResponse.status}] Error fetching game info | universeId: ${universeId}`);
        }

        const responseData = await gamesResponse.json();
        if (responseData && responseData.data.length > 0) {
            const { playing, visits } = responseData.data[0];

            animateOdometer(playing, onlineCountElement);
            visitCountElement.textContent = formatNumber(visits);

            game.playing = playing;
            game.visits = visits;
            window.dispatchEvent(gamesUpdatedEvent);

            if (!hasSuffix(visitCountElement.textContent)) {
                animateOdometer(visits, visitCountElement);
            }

            // Use the stored thumbnail if available
            if (game.thumbnailUrl) {
                thumbnailElement.src = game.thumbnailUrl; // Set the thumbnail src
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

async function updateAllGamesInfo() {
    games.forEach(async (game) => {
        const { universeId, onlineCountElementId, visitCountElementId, thumbnailElementId } = game;
        const onlineCountElement = document.getElementById(onlineCountElementId);
        const visitCountElement = document.getElementById(visitCountElementId);
        const thumbnailElement = document.getElementById(thumbnailElementId);
        
        await getUniverseInfo(universeId, onlineCountElement, visitCountElement, thumbnailElement, game);
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
    fetchThumbnails(); // Fetch thumbnails on load
    debouncedUpdate();
    setInterval(debouncedUpdate, 5000);
});
