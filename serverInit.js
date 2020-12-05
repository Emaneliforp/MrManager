require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

var firebase = require('firebase');
require('firebase/database');

var app = firebase.initializeApp({
  apiKey: process.env.apiKey,
  projectId: "mrmanager-web",
  databaseURL: "http://mrmanager-web.firebaseio.com"
});
const DB = firebase.database();
let allServers = {};

client.on("ready", () => {console.log("serverInit loaded")})

// allServers["id"] = {
//    "firstTask":{
//     "duration": "infinite",
//     "description": "a mysterous task",
//     "status": "???",
//     "level": "personal",
//     "targets": ["no one"],
//     "messageID": 0
//   }, 
//   "adminList": ["MrManager"],
// };
// DB.ref(`allServers/id`).set(allServers["id"]);

client.on("message", msg => {
  if(msg.author.bot) return;
  if(msg.content.toLowerCase() == "+serverinit"){
    DB.ref("allServers").once('value').then(snapshot => {
      allServers = snapshot.val();
        if(allServers[msg.guild.id]){
          const initEmbed = new Discord.MessageEmbed()
            .setColor('#83c8da')
            .setTitle("Server has already been initialized")
            .setDescription("type `+help` to learn more about other commands!")
          msg.channel.send(initEmbed);
          allServers = {};
        }
        else{
          console.log(msg.guild.channels.create('Task Chart')
            .catch(console.error));

          allServers[msg.guild.id] = {
            "firstTask":{
              "deadline": "infinite",
              "description": "a mysterous task",
              "status": "???",
              "level": "personal",
              "targets": ["no one"],
              "messageID": 0
            }, 
            "adminList": ["MrManager"],
          };

          const taskEmbed = new Discord.MessageEmbed()
                  .setColor('#83c8da')
                  .setTitle("TaskID: ")
                  .setDescription(allServers[msg.guild.id].description)
                  .addFields(
                    { name: 'People', value: allServers[msg.guild.id].targets, inline: true },
                    { name: 'Deadline', value: allServers[msg.guild.id].duration, inline: true},
                    { name: 'Status', value: allServers[msg.guild.id].status, inline: true},
                );


          DB.ref(`allServers/${msg.guild.id}`).set(allServers[msg.guild.id]);
          const initEmbed = new Discord.MessageEmbed()
            .setColor('#83c8da')
            .setTitle("Server has already been initialized")
            .setDescription("type `+help` to learn more about other commands!")
          msg.channel.send(initEmbed);
          allServers = {};
        }
    })
  }
});

client.login(process.env.TOKEN);

// allServers["id"] = {
//         "firstTask":{
//           "duration": "infinite",
//           "description": "a mysterous task",
//           "status": "???",
//           "level": "personal",
//           "targets": ["no one"]
//         }
//       };

// DB.ref(`allServers/id`).set(allServers["id"]);
