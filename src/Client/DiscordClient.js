const Discord = require('discord.js');

/**
 * Handles communication with the Discord API
 * @class DiscordClient
 */
class DiscordClient {
    /**
     * Creates an instance of DiscordClient.
     * @param {string} token
     * @memberof DiscordClient
     */
    constructor(token) {
        this._token = token;
        this._client = new Discord.Client();
        this._handlers = [];
    }

    /**
     * Gets the id of the current logged-in user
     * @return {string}
     * @memberof DiscordClient
     */
    getClientId() {
        return this._client.user.id;
    }

    /**
     * Registers a new event handler
     * @param {string} eventKey
     * @param {any} callback
     * @memberof DiscordClient
     */
    registerHandler(eventKey, callback) {
        this._client.on(eventKey, callback);
        this._handlers.push(eventKey);
    }

    /**
     * Sends a formatted message to the given channel
     * @param {any} channel
     * @param {string} message
     * @memberof DiscordClient
     */
    sendMessage(channel, message) {
        let embed = new Discord.RichEmbed();
        embed.setColor('#ff5722');
        embed.setThumbnail('https://d1u5p3l4wpay3k.cloudfront.net/wowpedia/c/c7/Executus.jpg');
        embed.setDescription(message);

        this.sendRichMessage(channel, embed, true);
    }

    /**
     * Sends a RichEmbed msg
     * @param {any} channel
     * @param {any} embedMsg
     * @param {boolean} timed
     * @memberof DiscordClient
     */
    async sendRichMessage(channel, embedMsg, timed = false) {
        if (channel == undefined) {
            channel = await getDefaultChannel(this._client.guilds.first())
                .catch((err) => {
                    console.error('Discord: Error getting the default channel!');
                });
        }

        if (embedMsg.thumbnail == undefined) {
            embedMsg.setThumbnail('https://cdn.freebiesupply.com/logos/large/2x/world-of-warcraft-logo-png-transparent.png');
        }
        embedMsg.setTimestamp();

        channel.send({embed: embedMsg})
            .then((msg) => {
                if (timed) {
                    msg.delete(ExecutusBot.config.getValue('discord.message_timeout', 10) * 1000);
                }
            })
            .catch((err) => {
                console.error('Discord: Couldn\'t send the message!', err.message);
            });
    }

    /**
     * Sends a direct message to the given user
     * @param {any} user
     * @param {string} message
     * @memberof DiscordClient
     */
    sendPrivateMessage(user, message) {
        user.dmChannel.send(message);
    }

    /**
     * Logs into Discord
     * @return {Promise}
     * @memberof DiscordClient
     */
    login() {
        return new Promise((resolve, reject) => {
            this._client.login(this._token)
                .then((ok) => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * Closes the session and destroys the client
     * @memberof DiscordClient
     */
    logout() {
        this._client.destroy();
    }
}

/**
 * Attemps to get the default channel in the guild (server)
 * @param {any} guild
 * @return {TextChannel}
 */
async function getDefaultChannel(guild) {
    // Check for a "general" channel, which is often default chat
    if (guild.channels.exists('name', 'general')) {
      return guild.channels.find('name', 'general');
    }

    // Now we get into the heavy stuff: first channel in order where the bot can speak
    // hold on to your hats!
    return guild.channels
     .filter((c) => c.type === 'text' &&
       c.permissionsFor(guild.client.user).has('SEND_MESSAGES'))
     .sort((a, b) => a.position - b.position ||
       Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
     .first();
}

module.exports = DiscordClient;
