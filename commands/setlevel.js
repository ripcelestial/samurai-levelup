const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Set a user\'s level directly')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option => 
      option.setName('user').setDescription('The user').setRequired(true))
    .addIntegerOption(option => 
      option.setName('level').setDescription('New level (1-1000)').setRequired(true)),

  async execute(interaction, db) {
    const target = interaction.options.getUser('user');
    const level = interaction.options.getInteger('level');

    if (level < 1) return interaction.reply("Level must be at least 1.");

    const xp = Math.floor(Math.pow(level / 0.1, 2));

    db.prepare('INSERT OR REPLACE INTO levels (userId, guildId, xp, level) VALUES (?, ?, ?, ?)')
      .run(target.id, interaction.guild.id, xp, level);

    await interaction.reply(`✅ Set ${target}'s level to **${level}**`);
  }
};
