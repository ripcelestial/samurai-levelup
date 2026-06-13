const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
require('dotenv').config();
const db = require('./database.js');

// === Keep-alive server for Render.com Free Tier ===
const app = express();
app.get('/', (req, res) => res.send('Leveling Bot is Alive! 🚀'));
app.listen(3000, () => console.log('✅ Keep-alive server running on port 3000'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();

// Load all commands
const { rank } = require('./commands/rank');
const { leaderboard } = require('./commands/leaderboard');
const { givexp } = require('./commands/givexp');
const { setlevel } = require('./commands/setlevel');
const { reset } = require('./commands/reset');

client.commands.set('rank', rank);
client.commands.set('leaderboard', leaderboard);
client.commands.set('givexp', givexp);
client.commands.set('setlevel', setlevel);
client.commands.set('reset', reset);

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is now online!`);

  // Register Slash Commands (runs once when bot starts)
  try {
    await client.application.commands.set(
      [...client.commands.values()].map(cmd => cmd.data)
    );
    console.log('✅ Slash commands registered successfully!');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  const xpToAdd = Math.floor(Math.random() * 15) + 10; // 10-25 XP

  const data = db.prepare('SELECT * FROM levels WHERE userId = ? AND guildId = ?')
    .get(message.author.id, message.guild.id);

  let levelUp = false;
  let newLevel = 1;

  if (data) {
    const newXP = data.xp + xpToAdd;
    newLevel = Math.floor(0.1 * Math.sqrt(newXP));

    if (newLevel > data.level) levelUp = true;

    db.prepare('UPDATE levels SET xp = ?, level = ? WHERE userId = ? AND guildId = ?')
      .run(newXP, newLevel, message.author.id, message.guild.id);
  } else {
    db.prepare('INSERT INTO levels (userId, guildId, xp, level) VALUES (?, ?, ?, 1)')
      .run(message.author.id, message.guild.id, xpToAdd);
  }

  if (levelUp) {
    await message.channel.send(`🎉 <@${message.author.id}> leveled up to **Level ${newLevel}**!`);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (command) {
    try {
      await command.execute(interaction, db);
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: '❌ There was an error while executing this command!', 
        ephemeral: true 
      });
    }
  }
});

client.login(process.env.TOKEN);
