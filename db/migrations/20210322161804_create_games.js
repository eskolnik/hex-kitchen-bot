exports.up = function (knex) {
    return knex.schema.createTable("Games", function (table) {
        table.increments("Id");
        table.string("ServerId", 255).notNullable();
        table.dateTime("DateCreated").notNullable();
        table.dateTime("DateUpdated").notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("Games");
};
