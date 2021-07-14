const cache = require("../db/cache");

class Ingredient {
    constructor(name, serverId, quantity) {
        this.name = name;
        this.serverId = serverId;
        this.quantity = quantity;
    }

    saveToCache() {
        cache.save(this.makeCacheKey(this.name, this, this.serverId));
    }

    static getFromCache(name, serverId) {
        const cacheKey = this.makeCacheKey(name, serverId);
        try {
            const data = cache.get(cacheKey);
            return new Ingredient(name, serverId, data.quantity);
        } catch (err) {
            console.log(err);
            return new Ingredient();
        }
    }

    static makeCacheKey(name, serverId) {
        return serverId + "-ingredient-" + name;
    }
}

module.exports = Ingredient;
