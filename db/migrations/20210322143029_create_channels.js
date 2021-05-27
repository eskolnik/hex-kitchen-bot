exports.up = function (knex) {
    return knex.schema.createTable("Channels", function (table) {
        table.increments("Id");
        table.string("Name", 255).notNullable();
        table.string("Slug", 255).notNullable();
        table.string("InitialState", 255).nullable();
        table.integer("ChannelType").unsigned().notNullable();
        table.foreign("ChannelType").references("ChannelTypes.Id");
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("Channels");
};
