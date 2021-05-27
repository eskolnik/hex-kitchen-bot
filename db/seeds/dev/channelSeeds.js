exports.seed = async function (knex) {
    // Set up ChannelTypes table
    await knex("ChannelTypes").del();
    const typesA = await knex("ChannelTypes").insert([
        { Id: 1, Name: "text" },
        { Id: 2, Name: "voice" },
        { Id: 3, Name: "category" },
    ]);

    // Set up Channels table
    await knex("Channels").del();
    const types = await knex.select().from("ChannelTypes");
    await knex("Channels").insert([
        {
            Name: "test",
            Slug: "test",
            ChannelType: types[0].Name,
        },
    ]);
};
