// Update with your config settings.

module.exports = {
    development: {
        client: "sqlite3",
        connection: {
            filename: "./db/dev.sqlite3",
        },
        migrations: {
            directory: "./db/migrations",
        },
        seeds: {
            directory: "./db/seeds/dev",
        },
        useNullAsDefault: true,
    },

    test: {
        client: "sqlite3",
        connection: {
            filename: "./db/test.sqlite3",
        },
        migrations: {
            directory: "./db/migrations",
        },
        seeds: {
            directory: "./db/seeds/test",
        },
        useNullAsDefault: true,
    },

    staging: {
        client: "sqlite3",
        connection: {
            filename: "./db/staging.sqlite3",
        },
        migrations: {
            directory: "./db/migrations",
        },
        seeds: {
            directory: "./db/seeds/staging",
        },
        useNullAsDefault: true,
    },

    production: {
        client: "sqlite3",
        connection: {
            filename: "./db/production.sqlite3",
        },
        migrations: {
            directory: "./db/migrations",
        },
        seeds: {
            directory: "./db/seeds/production",
        },
        useNullAsDefault: true,
    },
};
