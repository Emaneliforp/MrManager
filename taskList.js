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

var taskId = 1;

let getAllServers = require("./firebase.js").getAllServers;
let setAllServers = require("./firebase.js").setAllServers;
let setServer = require("./firebase.js").setServer;

let server = {};

client.on("ready", () => {console.log("+tasklist")})

client.on("message", msg => {
  if(msg.author.bot) return;
  
  if(msg.content.toLowerCase().startsWith("+tasklist")) {
    DB.ref(`allServers/${msg.guild.id}`).once('value').then(snapshot => {
      server = snapshot.val();
      if(!server) return msg.channel.send("Please type `+serverInit` to initialize the server!");
      
      if(!msg.mentions.users.first()) return msg.channel.send("Whose task are you checking? `+taskList [target]`");
      
      let target = msg.mentions.users.first() || msg.author;;
      const taskEmbed = new Discord.MessageEmbed()
      .setColor('#83c8da')
      //.setAuthor(target.split("#")[0]+"'s taskList");
      let empty = true;
      for(let task in server){
        if(!parseInt(task)) break
        if(server[task]['targets'].includes(target.id)){
          taskEmbed.addField(`#${task}`, `**deadline:** ${server[task]['deadline']}⠀⠀⠀⠀**status:** ${server[task]['status']}`);
          empty = false;
        }
      }
      if(empty){
        taskEmbed.setTitle("You have no task")
        taskEmbed.setDescription("Good job!")
      }
      msg.channel.send(taskEmbed);
      server = {};
    })
  }
});

client.login(process.env.TOKEN);