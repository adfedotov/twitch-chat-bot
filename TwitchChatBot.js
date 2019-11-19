const tls = require('tls');
const EventEmitter = require('events');

/**
 * TwitchChatBot
 * 
 * Commands start with ! in this implementation i.e. '!roll'
 * Commands emit command events i.e. '!roll' emits '!roll'
 * Bot also emits 'connect' when the client has connected to the IRC
 */
class TwitchChatBot extends EventEmitter {
    /**
     * Create a new instance of Bot by passing conenction information.
     * 
     * @param {string} host 
     * @param {integer} port 
     * @param {string} botUsername 
     * @param {string} oauthToken 
     * @param {list|null} channelList 
     */
    constructor(host, port, botUsername, oauthToken, channelList=null) {
        super();
        this.host = host;
        this.port = port;
        this.botUsername = botUsername;
        this.oauthToken = oauthToken;
        this.client = new tls.TLSSocket();
        this.client.setEncoding('utf-8');

        this.channelList = channelList ? new Set(channelList) : new Set();

        // Separate place for all patterns, maybe new RegEx()?
        this.userEventPattern = /^:(\w+)!\1@\1.* (\w+) #(\w+) :(.*)/g;
        this.pingEventPattern = /^PING /;

        this.commandPattern = /^(!\w+) ?(.*)?/g;
    }

    /**
     * Connect to IRC, if quiet, will not show oauth and bot name
     * 
     * @param {boolean} quiet 
     */
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
            this.emit('connect');
        })
        .on('data', (data) => {
            console.log('> ' + data);
            this.handleIncomingMessage(data);
        })
        .on('error', (err) => {
            console.log(err);
            this.client.destroy();
            process.exit(1);
        })
        .on('disconnect', () => { // Should disconnect try to reconnect and rejoin all chats recorded?
            console.log('Disconnected!');
        });
    }

    /**
     * Send an IRC messgae, if quiet, message will not be logged
     * 
     * @param {string} message 
     * @param {boolean} quiet 
     */
    sendIRC(message, quiet=false) {
        if (!quiet) {
            console.log('< ' + message);
        }

        this.client.write(message + '\n');
    }

    /**
     * Send a message in chat
     * 
     * @param {string} message 
     */
    sendMessage(message) {
        if (typeof message !== 'string') {
            throw new TypeError('Message must be a string');
        }

        this.sendIRC(`PRIVMSG #qubee :${message}`);
    }

    /**
     * Connect to channel
     * 
     * @param {string} channelName 
     */
    joinChannel(channelName) { // TODO: Need to handle join channel errors
        if (typeof channelName !== 'string') {
            throw new TypeError('Channel Name must be a string');
        }

        const channel = channelName.toLowerCase();

        if (this.channelList.has(channel)) {
            console.log('Bot is already in this channel!');
        } else {
            this.channelList.add(channel);
            this.sendIRC(`JOIN #${channelName}`);
        }
    }

    /**
     * Handles an incoming message
     * 
     * @param {string} message 
     */
    handleIncomingMessage(message) { 
        let data;
        if (data = this.userEventPattern.exec(message)) {
            this.onUserEvent(data);
            this.userEventPattern.lastIndex = 0;
        }
        else if (this.pingEventPattern.test(message)) {
            this.onPing()
        }
    }

    /**
     * Handles user interactions
     * 
     * @param {array} data 
     */
    onUserEvent(data) { // TOOD msg is optional in some cases?
        const [original, user, command, channel, message] = data;

        if (command === 'PRIVMSG') {
            let userCommand = this.commandPattern.exec(message);
            if (userCommand) {
                this.emit(userCommand[1], { user: user, channel: channel, arguments: userCommand[2] });
            }
            this.commandPattern.lastIndex = 0;
        }  
    }

    /**
     * Responds with PONG on PING requests
     */
    onPing() { // TODO: should it work with different IRCs?
        this.sendIRC('PONG :tmi.twitch.tv');
    }

}

exports.TwitchChatBot = TwitchChatBot;
