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

client.on("ready", () => {console.log("+addtask loaded successfully")})

client.on("message", msg => {
  if(msg.author.bot) return;
  
  // +addtask [target] [duration] [desc]
  if(msg.content.toLowerCase().startsWith("+addtask")) {
    
    // if server not initialized
    DB.ref(`allServers/${msg.guild.id}`).once('value').then(snapshot => {
      allServers[msg.guild.id] = snapshot.val();
      
      if(!allServers[msg.guild.id]) return msg.channel.send("Please type `+serverInit` to initialize the server!");

      // splits message
      let preDescription = msg.content.toLowerCase().substr(0, msg.content.toLowerCase().indexOf('\"')-1);
      // components up to description
      let components = preDescription.split(' ');
      
      let target = msg.mentions.users.first() || msg.author;
      target = `<@!${target.id}>`;
      // formats description
      let description = msg.content.toLowerCase().substr(msg.content.toLowerCase().indexOf('\"'));
      description = description.split('\"')[1]; 

      // if wrong number of args in message
      if(components.length != 3) return msg.channel.send("Wrong criteria! \nFollow format: +addtask [target] MM/DD-time \"[desc]\"");    

      
      // Work on Date object
      
      let inputDate = components[2];
      let day = inputDate.substr(0,inputDate.indexOf("-"));
      let time = inputDate.substr(inputDate.indexOf("-")+1);
      
      
      // messageId of this task
      let id = 0;
      
      // creates new task
      let newTask = 
          {
            "deadline": day + " " + time,
            "description": description,
            "status": "not started",
            "targets": target,
          }

      var taskId = 1;

      while( taskId in allServers[msg.guild.id] ) {
        taskId++;
      }
      
      
      
      const taskEmbed = new Discord.MessageEmbed()
              .setTitle("TaskID: " + taskId)
              .setDescription(description)
              .setColor(0xFF0000)
              .setFooter("___________________________________________________________________________________________")
              .addFields(
                { name: 'People', value: newTask.targets, inline: true },
                { name: 'Deadline', value: newTask.deadline, inline: true},
                { name: 'Status', value: newTask.status, inline: true},
              );
      
      // gets channel of chart
      let channel = msg.guild.channels.cache.find(channel => channel.name === 'task-chart');
      
      if(channel != null) {
        channel.send(taskEmbed).then(sent => { // 'sent' is that message you just sent
          newTask.messageID = sent.id;


          DB.ref("allServers/" + msg.guild.id + "/" + taskId).set(newTask);
          msg.channel.send("Task " + taskId + " successfully added! ");
          allServers = {};
        });
      
      } else {
        // if deleted, recreate channel
        msg.guild.channels.create('Task Chart')
        .then(created => {
          channel = msg.guild.channels.cache.find(channel => channel.name === 'task-chart');
        
          channel.send("+refresh `refreshing chart due to channel error`");
          
          channel.send(taskEmbed).then(sent => { // 'sent' is that message you just sent
            newTask.messageID = sent.id;

            // adds task
            DB.ref("allServers/" + msg.guild.id + "/" + taskId).set(newTask);
            msg.channel.send("Task " + taskId + " successfully added! ");
            allServers = {};
          });
        });
      }
    })
  }
});

client.login(process.env.TOKEN);