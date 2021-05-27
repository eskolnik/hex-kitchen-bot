const sqlite3 = require("sqlite3").verbose();
const { logger } = require("../utils/logger");

const environment = process.env.NODE_ENV || "development"; // if something else isn't setting ENV, use development
const configuration = require("../../knexfile.js")[environment]; // require environment's settings from knexfile
const database = require("knex")(configuration);

const dbPath = "./db/test.db";

module.exports = {
    query: async (sql, params) => {
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return logger.error(err.message);
            }
        });

        db.query = function (sql, params) {
            var that = this;
            return new Promise(function (resolve, reject) {
                that.all(sql, params, function (error, rows) {
                    if (error) {
                        logger.error("DB read failed", { sql, params });
                        reject(error);
                    } else resolve(rows);
                });
            });
        };

        let val = await db.query(sql, params);

        db.close((err) => {
            if (err) {
                return logger.error(err.message);
            }
        });

        return val;
    },
    database,
};
