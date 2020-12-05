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
  console.log("adminAdd loaded successfully");
});

//+adminAdd [role]
client.on("message", msg => {
  
  if (msg.author.bot) return;

  if (msg.content.toLowerCase().startsWith("+adminadd")) {
    if (!msg.member.hasPermission("ADMINISTRATOR"))
      return msg.channel.send("Only server admins can add MrManager admins!");
    DB.ref(`allServers/${msg.guild.id}`).once('value').then(snapshot => {
      allServers[msg.guild.id] = snapshot.val();
      if (!allServers[msg.guild.id])
        return msg.channel.send(
          "I can't find your server! Please type `+serverInit` to initialize it."
        );
      let components = msg.content.split(" ");
      if (components.length != 2)
        return msg.channel.send(
          "Wrong number of arguments! Type +help for more info"
        );
      DB.ref("allServers/" + msg.guild.id + "/adminList")
        .once("value")
        .then(snapshot => {
        let adminRoles = snapshot.val();

        if(adminRoles.includes(components[1]))
          return msg.channel.send("This role already has admin permissions");

        adminRoles.push(components[1]);

        DB.ref("allServers/" + msg.guild.id + "/adminList").set(adminRoles);
        return msg.channel.send("Successfully added role to admin list!");
      });
    })
  }
});

client.login(process.env.TOKEN);
