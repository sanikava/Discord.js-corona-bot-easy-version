const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const { Client, Collection } = require("discord.js");
const { token, prefix, cacheTime } = require("./config");

const bot = new Client();
bot.commands = new Collection();
bot.virusData = {};
bot.summedData = {};
bot.lastCacheUpdate = 0;

// Credits to https://discordjs.guide/ for command handler and mention prefix
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function updateData() {
    if (Date.now() - bot.lastCacheUpdate < cacheTime) {
        return;
    }

    const response = await fetch("https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/2/query?f=json&where=Confirmed%20%3E%200&outFields=Country_Region,Confirmed,Deaths,Recovered&orderByFields=Confirmed%20desc");
    const data = await response.json();

    bot.virusData = data.features;
    bot.summedData = data.features.reduce((prev, curr) => {
        return {
            confirmed: prev.confirmed + curr.attributes.Confirmed,
            recovered: prev.recovered + curr.attributes.Recovered,
            deaths: prev.deaths + curr.attributes.Deaths
        }
    }, { confirmed: 0, recovered: 0, deaths: 0 });

    bot.lastCacheUpdate = Date.now();
}

// Events
bot.once("ready", () => {
    console.log("[BOT] Logged in to Discord.");

    // Load commands
    const commandsPath = path.resolve(__dirname, "commands");
    if (!fs.existsSync(commandsPath)) {
        console.error(`[ERROR] "commands" directory does not exist.`);
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        try {
            const cmd = require(path.resolve(commandsPath, file));

            if (bot.commands.has(cmd.name)) {
                console.error(`[ERROR] A command named "${cmd.name}" already exists.`);
                continue;
            }

            bot.commands.set(cmd.name, cmd);

            console.log(`[COMMANDS] Added command "${cmd.name}".`);
        } catch (e) {
            console.error(`[ERROR] Failed to load "${file}": ${e.message}`);
        }
    }

    console.log(`[COMMANDS] Loaded ${bot.commands.size} command(s).`);
});

bot.on("message", async (message) => {
    if (message.author.bot) {
        return;
    }

    const prefixRegex = new RegExp(`^(<@!?${bot.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) {
        return;
    }

    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);

    const command = bot.commands.get(args.shift().toLowerCase());
    if (!command) {
        return;
    }

    if (command.requiredArgs && args.length < 1) {
        message.channel.send(`${message.author}, you did not provide any arguments. (Correct usage: \`${prefix}${command.name} ${command.requiredArgs}\`)`);
        return;
    }

    try {
        await updateData();
        command.execute(bot, message, args);
    } catch (e) {
        console.error(`[ERROR] Error while executing command "${command.name}": ${e.stack || e}`);
    }
});

// Login
bot.login(token);