const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "country",
    requiredArgs: "<country name>",
    execute: (bot, message, args) => {
        const countryName = args.join(" ").toLowerCase();
        if (!countryName) {
            return;
        }

        const countryStats = bot.virusData.find(data => data.attributes.Country_Region.toLowerCase() === countryName);
        if (!countryStats) {
            const embed = new MessageEmbed()
                .setTitle("COVID-19 Stats")
                .setDescription(`**Use one of:** ${bot.virusData.map(data => data.attributes.Country_Region).join(", ")}`);

            message.channel.send(embed);
            return;
        }

        const embed = new MessageEmbed()
            .setTitle(`COVID-19 Stats: ${countryStats.attributes.Country_Region}`)
            .addField("Confirmed", countryStats.attributes.Confirmed, true)
            .addField("Recovered", countryStats.attributes.Recovered, true)
            .addField("Deaths", countryStats.attributes.Deaths, true)
            .setFooter(`Updated: ${new Date(bot.lastCacheUpdate).toUTCString()}`);

        message.channel.send(embed);
    }
};