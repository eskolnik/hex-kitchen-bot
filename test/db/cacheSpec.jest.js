const cache = require("../../src/db/cache");

describe("cache", () => {
    beforeEach(() => {
        // wipe the cache before each test.
        cache.clearCache();
    });
    test("Add a new item", () => {
        const mockGuildId = "abcd";
        const mockScript = "script";

        cache.addGame(mockGuildId, mockScript);

        expect(cache.getGameByGuildId(mockGuildId)).toEqual(mockScript);
    });
    test("Add an existing item", () => {
        const mockGuildId = "abcd";
        const mockScript = "script";

        cache.addGame(mockGuildId, mockScript);
        const secondTry = cache.addGame(mockGuildId, mockScript);

        expect(secondTry).toBe(false);

        expect(cache.getGameByGuildId(mockGuildId)).toEqual(mockScript);
    });
    test("Remove an existing item", () => {
        const mockGuildId = "abcd";
        const mockScript = "script";

        cache.addGame(mockGuildId, mockScript);

        const response = cache.removeGame(mockGuildId);

        expect(response).toBe(true);
        expect(cache.getGameByGuildId(mockGuildId)).not.toBe(mockScript);
        expect(cache.getGameByGuildId(mockGuildId)).toBeUndefined();
    });
});
