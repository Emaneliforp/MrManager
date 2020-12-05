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
let setAllServers = require("./firebase.js").setAllServers;
let setServer = require("./firebase.js").setServer;
let getTask = require("./firebase.js").getTask;
let setTask = require("./firebase.js").setTask;

let allServers = {};
DB.ref("allServers").once("value").then(snapshot => {
  allServers = snapshot.val();
})

client.on("ready", () => {console.log("editTask loaded successfully")})

//+edittask [taskId] [duration] [desc]
client.on("message", msg => {
  if (msg.author.bot) return;

  if (msg.content.toLowerCase().startsWith("+edittask")) {
    
    let authorized = false;
    //if server is not initialized
    DB.ref(`allServers/${msg.guild.id}`).once('value').then(snapshot => {
      allServers[msg.guild.id] = snapshot.val();
      
      if(!allServers[msg.guild.id]) return msg.channel.send("Please type `+serverInit` to initialize the server!");
      //splits message
      let preDescription = msg.content.toLowerCase().substr(0,msg.content.toLowerCase().indexOf('\"')-1);
      //components up to description
      let components = preDescription.split(' ');
      
      let description = msg.content.toLowerCase().substr(msg.content.toLowerCase().indexOf('\"'));
      description = description.split('\"')[1]; 
      components.push(description);
      //wrong number of arguments
      if (components.length != 4)
        return msg.channel.send("Incorrect number of arguments! Type +help for more info.");   

      //task doesn't exist
      if (snapshot.val()[components[1]] == null)
        return msg.channel.send("Task does not exist! Create a new task with +addTask."); 
      
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
      
      // Work on Date object
      
      let inputDate = components[2];
      let day = inputDate.substr(0,inputDate.indexOf("-"));
      let time = inputDate.substr(inputDate.indexOf("-")+1);
      let dayTime = day + " " + time;
      
      msg.channel.send("Task " + components[1] + " has been edited.");
      DB.ref("allServers/" + msg.guild.id + "/" + components[1] + "/deadline").set(dayTime);
      DB.ref("allServers/" + msg.guild.id + "/" + components[1] + "/description").set(components[3]);
      
      
      
      // Altering task chart
      
      let channel = msg.guild.channels.cache.find(channel => channel.name === 'task-chart'); // gets task chart channel        

      let ID = snapshot.val()[components[1]]["messageID"]; // gets message ID to edit
      
      
      
      let thisTask = snapshot.val()[components[1]]; // gets this task
      
      // if channel exists
      if(channel != null) {
        channel.messages.fetch({around: ID, limit: 1}) // gets message
        .then(message => {
          
          let color = 0xFFFF00

          if(thisTask.status == "not started")
            color = 0xFF0000
          else if(thisTask.status == "done")
            color = 0x00ff00


          let embedMessage = new Discord.MessageEmbed() // new embed
              .setColor(color)
              .setTitle("TaskID: " + components[1])
              .setDescription(components[3])
              .setFooter("___________________________________________________________________________________________")
              .addFields(
                { name: 'People', value: thisTask.targets, inline: true },
                { name: 'Deadline', value: dayTime, inline: true},
                { name: 'Status', value: thisTask.status, inline: true},
              );
          message.first().edit(embedMessage); // edits message
        });
      
      } else {
        // if deleted, recreate channel
        msg.guild.channels.create('Task Chart')
        .then(created => {
          channel = msg.guild.channels.cache.find(channel => channel.name === 'task-chart');
        
          channel.send("+refresh `refreshing chart due to channel error`");
          
          channel.messages.fetch({around: ID, limit: 1}) // gets message
          .then(message => {

            let color = 0xFFFF00

            if(thisTask.status == "not started")
              color = 0xFF0000
            else if(thisTask.status == "done")
              color = 0x00ff00


            let embedMessage = new Discord.MessageEmbed() // new embed
                .setColor(color)
                .setTitle("TaskID: " + components[1])
                .setDescription(components[3])
                .setFooter("___________________________________________________________________________________________")
                .addFields(
                  { name: 'People', value: thisTask.targets, inline: true },
                  { name: 'Deadline', value: dayTime, inline: true},
                  { name: 'Status', value: thisTask.status, inline: true},
            );
            message.first().edit(embedMessage).catch(console.error); // edits message
          });
          
        });
      }
      
      
    });
  }
});

client.login(process.env.TOKEN);
