const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "total",
    execute: (bot, message) => {
        const embed = new MessageEmbed()
            .setTitle("COVID-19 Stats")
            .addField("Confirmed", bot.summedData.confirmed, true)
            .addField("Recovered", bot.summedData.recovered, true)
            .addField("Deaths", bot.summedData.deaths, true)
            .setFooter(`Updated: ${new Date(bot.lastCacheUpdate).toUTCString()}`);

        message.channel.send(embed);
    }
};