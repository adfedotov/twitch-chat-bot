'use strict';

const config = require('./config/config.json');
const chalk = require('chalk');
const tls = require('tls');
const EventEmitter = require('events');

// let ircHandlers = [
//     [/^:(\w+[!@.][^ ]){3}.* PRIVMSG #(\w+) :(.*)*/g, onMessage],
//     [/^PING :.*/g, onPing],
// ];





class TwitchChatBot extends EventEmitter {
    constructor(host, port, botUsername, oauthToken, channelList=null) {
        super();
        this.host = host;
        this.port = port;
        this.bot_username = botUsername;
        this.oauth_token = oauthToken;
        this.client = new tls.TLSSocket();
        this.client.setEncoding('utf-8');

        this.channelList = channelList ? new set(channelList) : new set();
    }

    connect(quiet=false) {
        if (typeof this.host !== 'string') {
            throw new TypeError('Host must be a string');
        }

        if (!Number.isInteger(this.port)) {
            throw new TypeError('Port must be an integer');
        }

        this.client.connect(this.port, this.host, () => {
            console.log('Connecting...');
            this.sendIRC(`PASS ${this.oauthToken}`, quiet);
            this.sendIRC(`NICK ${this.botUsername}`, quiet);
        })
        .on('connect', () => {
            console.log('Connection established!');
        })
        .on('data', (data) => {
            /**
             * Received data can be:
             * PRIVMSG
             * PING
             * 
             */
            console.log('> ' + data);


        })
        .on('error', (err) => {
            console.log(err);
            this.client.destroy();
            process.exit(1);
        })
        .on('disconnect', () => {
            console.log('Disconnected!');
        });
    }

    sendIRC(message, quiet=false) { // TODO: Need to handle write status
        if (!quiet) {
            console.log('< ' + message);
        }

        this.client.write(message + '\r\n');
    }

    joinChannel(channelName) { // TODO: Need to handle join channel errors
        if (typeof channelName !== 'string') {
            throw new TypeError('Channel Name must be a string');
        }

        const channel = channelName.toLowerCase();

        if (this.channelList.has(channel)) {
            console.log('Bot is already in this channel!');
        } else {
            this.channelList.add(channel);
            this.sendIRC(`JOIN ${channelName}`);
        }
    }


}

const t = new TwitchChatBot(config.HOST, config.PORT, config.BOT_USERNAME, config.OAUTH_TOKEN);
t.connect(true);







// client.on('data', (data) => {
//     console.log(chalk.bgGreen('> ') + chalk.green(data));

//     let patternMatch = false;
//     for (let handler = 0; handler < ircHandlers.length; handler++) {
//         if (ircHandlers[handler][0].test(data)) {
//             ircHandlers[handler][1](data);
//             patternMatch = true;
//         }
//     }

//     if (!patternMatch) onUnmatched(data);
// });

// client.on('close', () => {
//     console.log('Connection ended...');
// });
