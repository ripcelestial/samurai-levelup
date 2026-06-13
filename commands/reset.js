const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset XP/levels for a user or everyone')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option => 
      option.setName('user').setDescription('User to reset (leave empty to reset all)')),

  async execute(interaction, db) {
    const target = interaction.options.getUser('user');

    if (target) {
      db.prepare('DELETE FROM levels WHERE userId = ? AND guildId = ?')
        .run(target.id, interaction.guild.id);
      return interaction.reply(`✅ Reset all XP and level for ${target}.`);
    } 

    // Reset everyone - confirmation
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_resetall')
        .setLabel('Yes, reset everyone')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('cancel_reset')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: '⚠️ **DANGER**: Do you really want to reset **ALL** users\' XP and levels in this server?',
      components: [row]
    });
  }
};
