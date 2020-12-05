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
DB.ref("allServers/").once('value').then(snapshot => {
  allServers = snapshot.val();
})

client.on("ready", () => {
  
  console.log("chart loaded successfully")

})

client.on("message", msg => {
  if(!msg.content.toLowerCase().startsWith("+refresh"))
    return;
  
  DB.ref("allServers/" + msg.guild.id).once("value").then(snapshot => {
    let channel = msg.guild.channels.cache.find(channel => channel.name === 'task-chart');
    // delete channel if it exists
    if(channel != null)
      channel.delete();
    
    
    
    const reChannel = msg.guild.channels.create('Task Chart', { type: 'text' }).then(newChannel => {
      
      snapshot.forEach((child) => {
        let thisTask = child.val();
        let color = 0xFFFF00
        
        if(thisTask.status == "not started")
          color = 0xFF0000
        else if(thisTask.status == "done" || thisTask.status[2] == "finished")
          color = 0x00ff00

        if(child.key != "adminList" && child.key != "firstTask") {
          const taskEmbed = new Discord.MessageEmbed()
                .setTitle("TaskID: " + child.key)
                .setColor(color)
                .setDescription(thisTask.description)
                .setFooter("___________________________________________________________________________________________")
                .addFields(
                  { name: 'People', value: thisTask.targets, inline: true },
                  { name: 'Deadline', value: thisTask.deadline, inline: true},
                  { name: 'Status', value: thisTask.status, inline: true},
                );


          newChannel.send(taskEmbed).then(sent => { // 'sent' is that message you just sent

            DB.ref("allServers/" + msg.guild.id + "/" + child.key + "/messageID").set(sent.id);
          });
        
        }
      });
    });
    
    allServers = {};
    
    
  });
});

client.login(process.env.TOKEN);