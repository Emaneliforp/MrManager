require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

var firebase = require("firebase");
require("firebase/database");

var app = firebase.initializeApp({
  apiKey: process.env.apiKey,
  projectId: "mrmanager-web",
  databaseURL: "http://mrmanager-web.firebaseio.com"
});

const DB = firebase.database();


let allServers = {};

client.on("ready", () => {
  console.log("markTask loaded successfully");
});

//+marktask [taskId] [status]
client.on("message", msg => {
  if (msg.author.bot) return;
  if (msg.content.toLowerCase().startsWith("+marktask")) {
    DB.ref(`allServers/${msg.guild.id}`).once('value').then(snapshot => {
      allServers[msg.guild.id] = snapshot.val();
      if (!allServers[msg.guild.id])
        return msg.channel.send(
          "I can't find your server! Please type `+serverInit` to initialize it."
        );
      let components = msg.content.split(" ");
      if (components.length != 3)
        return msg.channel.send(
          "Wrong number of arguments! Type +help for more info"
        );

      let authorized = false;
      DB.ref("allServers/" + msg.guild.id)
        .once("value")
        .then(snapshot => {
        
        
        let users = snapshot.val()[components[1]]["targets"];
        let authRoles = snapshot.val()["adminList"];
        if (users.includes(msg.author.id)) {
          authorized = true;
        }       
        else if (authRoles.includes("<@!"+msg.author.id+">")) {
          authorized = true;
        }
        else if(msg.member.roles.cache.array().some(r=> authRoles.includes("<@&" + r.id + ">"))){
          authorized = true;
        }
        else if (msg.member.hasPermission("ADMINISTRATOR")) {
          authorized = true;
        }
        if (!authorized){
          allServers = {};
          return msg.channel.send("You are not authorized to mark this task!");
        }
        DB.ref(
          "allServers/" + msg.guild.id + "/" + components[1] + "/status"
        ).set(components[2]);
        msg.react("👍");


        // Altering task chart

        let channel = msg.guild.channels.cache.find(channel => channel.name === 'task-chart'); // gets task chart channel        

        let ID = snapshot.val()[components[1]]["messageID"]; // gets message ID to edit

        console.log("Message ID " + ID);
        let thisTask = snapshot.val()[components[1]]; // gets this task

        if(channel != null) {
          channel.messages.fetch({around: ID, limit: 1}) // gets message
          .then(message => {

            console.log("Fetched Message ID " + message.first().id + thisTask.status);

            let color = 0xFFFF00

            if(components[2] == "not started")
              color = 0xFF0000
            else if(components[2] == "done" || components[2] == "finished")
              color = 0x00ff00

            let embedMessage = new Discord.MessageEmbed() // new embed
                .setColor(color)
                .setTitle("TaskID: " + components[1])
                .setDescription(thisTask.description)
                .setFooter("___________________________________________________________________________________________")
                .addFields(
                  { name: 'People', value: thisTask.targets, inline: true },
                  { name: 'Deadline', value: thisTask.deadline, inline: true},
                  { name: 'Status', value: components[2], inline: true},
                );
            message.first().edit(embedMessage); // edits message
          });
        } else {
          msg.guild.channels.create('Task Chart').then(created => {
            channel = msg.guild.channels.cache.find(channel => channel.name === 'task-chart');
        
            channel.send("+refresh `refreshing chart due to channel error`");
            
            channel.messages.fetch({around: ID, limit: 1}) // gets message
            .then(message => {

              console.log("Fetched Message ID " + message.first().id + thisTask.status);

              let color = 0xFFFF00

              if(components[2] == "not started")
                color = 0xFF0000
              else if(components[2] == "done")
                color = 0x00ff00

              let embedMessage = new Discord.MessageEmbed() // new embed
                  .setColor(color)
                  .setTitle("TaskID: " + components[1])
                  .setDescription(thisTask.description)
                  .setFooter("___________________________________________________________________________________________")
                  .addFields(
                    { name: 'People', value: thisTask.targets, inline: true },
                    { name: 'Deadline', value: thisTask.deadline, inline: true},
                    { name: 'Status', value: components[2], inline: true},
                  );
              message.first().edit(embedMessage); // edits message
            });
          });  
        }
        
        allServers = {};


      });
    })
  }
});
client.login(process.env.TOKEN);
