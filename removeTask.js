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

let log = require("./firebase.js").log;
let getAllServers = require("./firebase.js").getAllServers;
let setAllServers = require("./firebase.js").setAllServers;
let setServer = require("./firebase.js").setServer;

let allServers = {};
DB.ref("allServers")
  .once("value")
  .then(snapshot => {
    allServers = snapshot.val();
  });

client.on("ready", () => {
  console.log("+removetask loaded successfully");
});

//+removetask [taskId]
client.on("message", msg => {
  if (msg.author.bot) return;
  if (msg.content.toLowerCase().startsWith("+removetask")) {
    DB.ref(`allServers/${msg.guild.id}`)
      .once("value")
      .then(snapshot => {
        allServers[msg.guild.id] = snapshot.val();

        //checks if server is initialized
        if (!allServers[msg.guild.id])
          return msg.channel.send(
            "I can't find your server! Please type `+serverInit` to initialize it."
          );
        let components = msg.content.split(" ");
      
        let authorized = false;
        let users = snapshot.val()[components[1]]["targets"];
        let authRoles = snapshot.val()["adminList"];
        if (users.includes(msg.author.id)) {
          authorized = true;
        } else if (authRoles.includes("<@!" + msg.author.id + ">")) {
          authorized = true;
        } else if (
          msg.member.roles.cache
            .array()
            .some(r => authRoles.includes("<@&" + r.id + ">"))
        ) {
          authorized = true;
        } else if (msg.member.hasPermission("ADMINISTRATOR")) {
          authorized = true;
        }
        if (!authorized) {
          allServers = {};
          return msg.channel.send("You are not authorized to mark this task!");
        }

        //checks if only command and taskname is included
        
        if (components.length != 2) {
          msg.channel.send("Whats the task's name?");
          return;
        }

        // Altering task chart

        let channel = msg.guild.channels.cache.find(
          channel => channel.name === "task-chart"
        ); // gets task chart channel

        let ID = snapshot.val()[components[1]]["messageID"]; // gets message ID to remove

        console.log("Message ID " + ID);
        let thisTask = snapshot.val()[components[1]]; // gets this task

        // if channel exists, remove from channel
        if (channel != null) {
          channel.messages
            .fetch({ around: ID, limit: 1 }) // gets message
            .then(message => {
              console.log("Fetched Message ID " + message.first().id);

              message.first().delete(); // removes message
            });
        }

        //sets task object to null

        let taskId = components[1];
        DB.ref("allServers/" + msg.guild.id + "/" + taskId).set(null);
        msg.channel.send("task removed!");
      });
  }
});
client.login(process.env.TOKEN);
