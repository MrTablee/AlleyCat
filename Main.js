const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const sql = require("sqlite");
const music = require('discord.js-music-v11');
sql.open("./score.sqlite");
const prefix = ".."
const config = require("./config.json")
var discord = require('discord-bot-webhook');
discord.hookId = '385323385254707200';
discord.hookToken = 'GNUVn9Mz15Yd9T-kxrnfK18_MHtsFud-Q7xlopUGMFljBu7W07Jm-SjdNBnSF1tiDnhZ';

// This loop reads the /events/ folder and attaches each event file to the appropriate event.
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let eventFunction = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    // super-secret recipe to call events with all their proper arguments *after* the `client` var.
    client.on(eventName, (...args) => eventFunction.run(client, ...args));
  });
});

client.on("message", message => {
  if (message.author.bot) return;
  if(message.content.indexOf('..') !== 0) return;



  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    } else {
      let curLevel = Math.floor(0.1 * Math.sqrt(row.points + 1));
      if (curLevel > row.level) {
        row.level = curLevel;
        sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
        message.channel.send(`Ayeeee, you've leveled up to level **${curLevel}**! Ain't that dandy ${message.author.username}?`);
      }
      sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
    }
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    });
  });

  if (!message.content.startsWith(prefix)) return;

  if (message.content.startsWith(prefix + "level")) {
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) return message.channel.send("Welp... your current level is 0");
      message.channel.send(`Your current level is ${row.level}`);
    });
  } else if (message.content.startsWith(prefix + "givepoints")) {
    sql.open("./score.sqlite"); 
    sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.users.first().id}"`).then(row => {
        if (!row) {
            sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
          } else {
    sql.run(`UPDATE scores SET points = ${row.points + 50} WHERE userId = ${message.mentions.users.first().id}`);
    message.channel.send(`Gave ${message.mentions.users.first().username} 50 points`)
 }})}

  if (message.content.startsWith(prefix + "points")) {
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) return message.channel.send("Sadly you do not have any points yet... Talk more");
      message.channel.send(`${message.author.username} you currently have ${row.points} points, good going!`);

    });
  }

  const args = message.content.slice('..'.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  try {
    let commandFile = require(`./commandsss/${command}.js`);
    commandFile.run(client, message, args);
  } catch (err) {
    client.channels.get('384821440844922882').send(`ERROR WHEN EXECUTING COMMAND: \`${command}\`\nCommand message: ${message.content}\nMessage author: ${message.author.tag} ID: ${message.author.id}\n \`\`\`${err}\`\`\``);
  }
  
  
  
});

client.login(config.ALLEYTOKEN);