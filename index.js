const config = require('./config/config.json');
const {TwitchChatBot} = require('./TwitchChatBot');

// Create new bot
const bot = new TwitchChatBot(config.HOST, config.PORT, config.BOT_USERNAME, config.OAUTH_TOKEN);

// Connect to server
bot.connect();

// After we are connected, we want to join rooms or execute other tasks
bot.on('connect', () => {
    bot.joinChannel('qubee');
});

// Create command handlers
bot.on('!hello', (params) => {
    bot.sendMessage(`Hello, ${params.user}!`);
});

bot.on('!roll', (params) => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    bot.sendMessage(`${params.user} rolled ${randomNumber}!`);
});
