const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "mostcases",
    execute: (bot, message) => {
        const embed = new MessageEmbed()
            .setTitle("COVID-19 Most Cases")
            .setDescription(bot.virusData.slice(0, 5).map((data, place) => `#${place + 1} - ${data.attributes.Country_Region} (${data.attributes.Confirmed} confirmed)`))
            .setFooter(`Updated: ${new Date(bot.lastCacheUpdate).toUTCString()}`);

        message.channel.send(embed);
    }
};