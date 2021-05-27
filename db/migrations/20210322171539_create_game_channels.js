exports.up = function (knex) {
    return knex.schema.createTable("GameChannels", function (table) {
        table.string("Snowflake", 255);
        table.integer("GameId").unsigned().notNullable();
        table.foreign("GameId").references("Games.Id").onDelete("CASCADE");
        table.integer("ChannelId").unsigned().notNullable();
        table
            .foreign("ChannelId")
            .references("Channels.Id")
            .onDelete("CASCADE");
        table.dateTime("DateCreated").notNullable();
        table.dateTime("DateUpdated").notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("GameChannels");
};
