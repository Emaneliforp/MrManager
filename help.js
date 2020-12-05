require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("help!");
  client.user.setActivity("MrManager"); 
})
client.on("message", msg => {
  if(msg.content.toLowerCase().startsWith("+help")){
    const helpEmbed = new Discord.MessageEmbed()
      .setColor('#83c8da')
      .setTitle("MrManager's Help")
      .setThumbnail("https://cdn.discordapp.com/avatars/767164705625735168/72f08d6e04cd04c801b9aebb937f09e3.png?size=256")
      .setDescription("MrManager is a task-managing bot with powerful tools that will allow your server's team to manage tasks and easily cooperate with each other!")
      .addFields(
        { name: '+serverInit', value: "Initialize the server into our database. This will enable the server to use the bot's commands. Each server only need to be initialized once.\n`+serverInit`\n" },
        { name: '+adminAdd', value: "Add bot admin permission to specific user. Bot admins will be able to edit or remove task of other users.\n`+adminAdd [target]`"},
        { name: '+addTask', value: "Assign task with deadline and description to specific user or role.\n`+addTask [target] [duration] [desc]`"},
        { name: '+taskList', value: "Show all of your or a role's tasks with completion status.\n`+taskList [target]`"},
        { name: '+editTask', value: "Change duration or description of a task.\n`+edittask [taskId] [duration] [desc]`"},
        { name: '+markTask', value: "Update progress status of the task. (not started, in progress, finished)\n`+edittask [target] [taskId] [status]`"},
        { name: '+removeTask', value: "Remove task.\n`+removetask [taskId]`"},
        { name: '+task', value: "Display duration, description and progress of a task.\n`+task [taskId]`"},
        { name: '+refresh', value: "Refresh the task chart channel.\n`+refresh`"},
        { name: '+invite', value: "Get bot invite link.\n`+invite`"},
      );
    msg.channel.send(helpEmbed);
  }
});

client.login(process.env.TOKEN);