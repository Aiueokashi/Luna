// ██████ Integrations █████████████████████████████████████████████████████████

// A powerful library for interacting with the Discord API
const { MessageEmbed } = require("discord.js"),
// The simplified HTTP request client 'request' with Promise support. Powered by Bluebird.
      rp               = require("request-promise");

// –––––– Parameters –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

module.exports = {

    name            : "ping",
    description     : "Sends test packets to the bot, and measures the response time.",
    cooldown        : 5,
    aliases         : ["🏓", "pong"],
    guildOnly       : false,
    privileges      : ["SEND_MESSAGES"],

// –––––– Execution ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

    async execute(Glossary, client, message) {

        const Lat = new Date().getTime() - message.createdTimestamp;
        var PResu = new MessageEmbed();

        // Retrieve status information
        await rp("https://srhpyqt94yxb.statuspage.io/api/v2/summary.json", { json: true })
            .then((DiscordappStatus) => {

                embed
                .setTitle(" Ｐ Ｏ Ｎ Ｇ !")
                .setColor("#7354f6")
                .addFields(
                    { name  : "— ヽ( •_•)O´¯\\`°.¸.·´¯\\`Q(^o^ )\\`",
                        value : [
                        "```",
                        `   ${Glossary.COM_Ping[0]} ${Lat}ms`,
                        ` ${Glossary.COM_Ping[1]} ${Math.round(client.ws.ping)}ms`,

                        `CloudFlare │ ${DiscordappStatus.components[4].status ? "OK !" : "✗"}`,
                        `       API │ ${DiscordappStatus.components[0].status ? "OK !" : "✗"}`,
                        `   Gateway │ ${DiscordappStatus.components[3].status ? "OK !" : "✗"}`,
                        `Med. Proxy │ ${DiscordappStatus.components[6].status ? "OK !" : "✗"}`,
                        `     Voice │ ${DiscordappStatus.components[7].status ? "OK !" : "✗"}`,
                        "```"
                        ].join("\n")
                    },
                    { name  : "— Servers Status",
                        value : ["```",
                        `   EU West │ ${DiscordappStatus.components[1].status ? "✔" : "✗"} : ${DiscordappStatus.components[12].status ? "✔" : "✗"} │ US West`,
                        `EU Central │ ${DiscordappStatus.components[2].status ? "✔" : "✗"} : ${DiscordappStatus.components[13].status ? "✔" : "✗"} │ Brazil`,
                        ` Singapore │ ${DiscordappStatus.components[5].status ? "✔" : "✗"} : ${DiscordappStatus.components[14].status ? "✔" : "✗"} │ Hong Kong`,
                        `    Sydney │ ${DiscordappStatus.components[8].status ? "✔" : "✗"} : ${DiscordappStatus.components[15].status ? "✔" : "✗"} │ Russia`,
                        `US Central │ ${DiscordappStatus.components[9].status ? "✔" : "✗"} : ${DiscordappStatus.components[16].status ? "✔" : "✗"} │ Japan`,
                        `   US East │ ${DiscordappStatus.components[10].status ? "✔" : "✗"} : ${DiscordappStatus.components[17].status ? "✔" : "✗"} │ South Afr`,
                        `  US South │ ${DiscordappStatus.components[11].status ? "✔" : "✗"} :   │ `,
                        "```"
                        ].join("\n")
                    },
                    { name  : "— Maintenance & Incidents",
                        value : ["```",
                        `     Event │ ${DiscordappStatus.incidents}${DiscordappStatus.scheduled_maintenances}`,
                        "```",
                        "[Discordapp Status](https://status.discordapp.com/)"
                        ].join("\n")
                    })

                .setFooter(`${Glossary.COM_Ping[2]}${message.author.username}`)
                .setTimestamp();

            })
            .catch(() => {

                embed
                .setDescription([
                    "```",
                    `   ${Glossary.COM_Ping[0]} ${Lat}ms`,
                    ` ${Glossary.COM_Ping[1]} ${Math.round(client.ws.ping)}ms`,
                    "```",
                ].join("\n"));
            });

        // Send the embed, and after that ...
        await message.channel.send(PResu).then((reply) => {
            // ... Adds a "trash" reaction
            reply.react("🗑");
            // Creation of a filter that only takes in consideration the trash emoji and ignores that added by the bot
            const filter = (reaction, user) => reaction.emoji.name === "🗑" && user.id !== client.user.id;
            // Create a "reaction collector" using the filter, with a maximum of 1
            reply.createReactionCollector(filter, {
                maxMatches: 1
            })
            // Removes the embed when a new reaction is received.
            .on("collect", () => reply.delete());
        });
    }
};