const prefix = ".."
const sql = require("sqlite");
sql.open("./score.sqlite");    
exports.run = (client, message, args) => {
    if (message.content.startsWith(prefix + "demonize") && message.author.id === "233366720062947330") {
        sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.users.first().username}"`).then(row => {            
        sql.run(`UPDATE scores SET points = 666, level = 666 WHERE userId = ${message.mentions.users.first().id}`);
        message.channel.send(`AAAAAAAAAAAAAA A DEMON, ${message.mentions.users.first().username}\nCheck your points`)
      })}
    }