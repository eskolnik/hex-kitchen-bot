exports.up = function (knex) {
    return knex.schema.createTable("ChannelTypes", function (table) {
        table.increments("Id");
        table.string("Name", 255).notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("ChannelTypes");
};
