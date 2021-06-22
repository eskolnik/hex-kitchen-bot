/**
 * Takes a script JSON file and creates game objects
 *
 * @param {File} scriptFile
 * @returns game objects
 */
function parseScript(scriptFile) {
    const rawData = JSON.parse(scriptFile);

    let { events, channels, categoryChannels, ...parsedData } = rawData;

    if (Array.isArray(events)) {
        parsedData["events"] = parseEvents(events);
    }

    if (Array.isArray(channels)) {
        parsedData["channels"] = parseChannels(channels);
    }

    if (Array.isArray(categoryChannels)) {
        parsedData["categoryChannels"] = parseCategories(categoryChannels);
    }

    return parsedData;
}

function parseChannels(data) {
    return data.map((channelData) => {
        return {
            ...channelData,
            channelId: null,
            open: false,
            webhook: null,
        };
    });
}

function parseCategories(data) {
    return data.map((category) => ({
        name: category.name,
        type: "category",
        channelId: null,
        open: false,
    }));
}

/**
 *
 * @param {Array<Object>} data An array of event object raw data
 * @returns Event objects with status and message properties, keyed by ID
 */
function parseEvents(data) {
    return data
        .map((event) => {
            return {
                ...event,
                status: "unavailable",
                messages: [],
            };
        })
        .reduce((acc, eventData) => {
            acc[eventData.id] = eventData;
            return acc;
        }, {});
}

module.exports = {
    parseScript,
};
