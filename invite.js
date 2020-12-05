//https://discord.com/api/oauth2/authorize?client_id=767164705625735168&permissions=268462160&scope=bot
require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("invite!");
})
client.on("message", msg => {
  if(msg.content.toLowerCase().startsWith("+invite")){
    const inviteEmbed = new Discord.MessageEmbed()
      .setColor('#83c8da')
      .setTitle("MrManager's Invite Link")
      .setDescription("https://discord.com/api/oauth2/authorize?client_id=767164705625735168&permissions=268462160&scope=bot")
    msg.channel.send(inviteEmbed);
  }
});

client.login(process.env.TOKEN);