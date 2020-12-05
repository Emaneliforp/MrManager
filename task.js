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

let getAllServers = require("./firebase.js").getAllServers;
let getTask = require("./firebase.js").getTask;

let allServers = {};

client.on("ready", () => {console.log("+task loaded successfully")})

//+task [taskId]
client.on("message", msg => {
  if(msg.author.bot) return;
  if(msg.content.toLowerCase().startsWith("+task ")){
    DB.ref(`allServers/${msg.guild.id}`).once('value').then(snapshot => {
      allServers[msg.guild.id] = snapshot.val();
      
      if(!allServers[msg.guild.id]) return msg.channel.send("Please type `+serverInit` to initialize the server!");
   
      let components = msg.content.split(" ");
      if(!parseInt(components[1])) return msg.channel.send("Which task are you trying to check? `+task [taskId]`");

      DB.ref("allServers/" + msg.guild.id + "/" + components[1]).once("value").then(snapshot => {
        let task = snapshot.val();

        if(task != null) {
          const taskEmbed = new Discord.MessageEmbed()
            .setColor('#83c8da')
            .setTitle("Task: " + components[1])
            .setThumbnail("https://cdn.discordapp.com/avatars/767164705625735168/72f08d6e04cd04c801b9aebb937f09e3.png?size=256")
            .setDescription(task.description)
            .addFields(
              { name: 'Deadline', value: task.deadline},
              { name: 'Status', value: task.status},
          );

          msg.channel.send(taskEmbed);
        }
        else {
          msg.channel.send("Error, task does not exist! Please try again or add a new task with +addTask.");
        }
      });
    });
  }
});




client.login(process.env.TOKEN);