const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top 10 members by level'),

  async execute(interaction, db) {
    const top = db.prepare(`
      SELECT userId, level, xp 
      FROM levels 
      WHERE guildId = ? 
      ORDER BY level DESC, xp DESC 
      LIMIT 10
    `).all(interaction.guild.id);

    if (top.length === 0) {
      return interaction.reply("No one has earned XP yet in this server.");
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Leaderboard - ${interaction.guild.name}`)
      .setColor(0x00ff88)
      .setTimestamp();

    top.forEach((entry, index) => {
      embed.addFields({
        name: `#${index + 1}`,
        value: `<@${entry.userId}> • **Level ${entry.level}** (${entry.xp} XP)`,
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
};
