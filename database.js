const SQLite = require('better-sqlite3');
const db = new SQLite('./levels.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS levels (
    userId TEXT,
    guildId TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    PRIMARY KEY (userId, guildId)
  )
`);

module.exports = db;
