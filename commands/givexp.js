const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('givexp')
    .setDescription('Give XP to a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option => 
      option.setName('user').setDescription('The user to give XP').setRequired(true))
    .addIntegerOption(option => 
      option.setName('amount').setDescription('Amount of XP to give').setRequired(true)),

  async execute(interaction, db) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const data = db.prepare('SELECT * FROM levels WHERE userId = ? AND guildId = ?')
      .get(target.id, interaction.guild.id) || { xp: 0, level: 1 };

    const newXP = data.xp + amount;
    const newLevel = Math.floor(0.1 * Math.sqrt(newXP));

    db.prepare('INSERT OR REPLACE INTO levels (userId, guildId, xp, level) VALUES (?, ?, ?, ?)')
      .run(target.id, interaction.guild.id, newXP, newLevel);

    await interaction.reply(`✅ Gave **${amount} XP** to ${target}. They are now **Level ${newLevel}**`);
  }
};
