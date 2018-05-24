const Discord = require('discord.js');
const ChatCommand = require('../Command');

/**
 * Gets info from in-game guilds
 * @class GuildCmd
 * @extends {ChatCommand}
 */
class GuildCmd extends ChatCommand {
    /**
     * Creates an instance of GuildCmd.
     * @memberof GuildCmd
     */
    constructor() {
        super('guild');
    }

    /**
     * Executes the command's logic
     * @param {any} req
     * @memberof GuildCmd
     */
    execute(req) {
        if (req.args.length == 0) {
            ExecutusBot.chatClient.sendMessage(req.channel, Lang._('error.missing_name'));
            return;
        }

        ExecutusBot.db.Characters.getGuildByName(req.args.join(' '))
            .then((guild) => {
                let embed = new Discord.RichEmbed();
                embed.setTitle(guild.name);
                embed.addField(Lang._('common.faction'), guild.faction);
                embed.addField(Lang._('common.created'), guild.created.toLocaleDateString());
                embed.addField(Lang._('common.members'), guild.membersCount);
                embed.addField(Lang._('common.leader'), guild.leader);

                ExecutusBot.chatClient.sendRichMessage(req.channel, embed);
            })
            .catch((err) => {
                console.log(err.message);
                ExecutusBot.chatClient.sendMessage(req.channel, Lang._('error.not_found'));
            });
    }
}

module.exports = GuildCmd;
