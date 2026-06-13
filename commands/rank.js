const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');

module.exports = {
  data: new SlashCommandBuilder().setName('rank').setDescription('Show your rank card'),
  async execute(interaction, db) {
    const data = db.prepare('SELECT * FROM levels WHERE userId = ? AND guildId = ?')
      .get(interaction.user.id, interaction.guild.id);

    if (!data) return interaction.reply("You haven't earned any XP yet!");

    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2f3136';
    ctx.fillRect(0, 0, 700, 250);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(interaction.user.tag, 20, 60);

    ctx.font = '30px sans-serif';
    ctx.fillText(`Level ${data.level}`, 20, 120);
    ctx.fillText(`${data.xp} XP`, 20, 170);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'rank.png' });
    await interaction.reply({ files: [attachment] });
  }
};
