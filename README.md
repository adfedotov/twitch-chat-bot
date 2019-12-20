# Twitch Chat Bot

Easy to use twitch chat bot that allows the developer to create functionality for chat commands. The app connect to twitch's IRC and handles the communication.

## Configuration
To run sample app, you need to specify the bot's username and OAuth token provided by Twitch.

Simpy start the index.js
```bash
node index.js
```

## Using the bot

```javascript
// Create new bot
const bot = new TwitchChatBot(irc_host, irc_port, bot_username, bot_oauth_token);

// Connect to Twitch's IRC
bot.connect();

// The bot emits 'connect' event on connect
bot.on('connect', () => {
  // Join Twitch channel
  bot.joinChannel(channel_name);
});
```

## Creating commands

```javascript
// Each time the app sees a command (chat message starting with !), the command is emitted
// For example:
bot.on('!hello', (params) => {
  // Do whatever cool stuff you need
});
```
#### Params
Params passed to the handlers are:
- user (username of the person who execute the command)
- channel (channel name, where the command was executed)
- arguments (whatever follows the command as a string)

## Sending messages to chat
```javascript
bot.on('!hello', (params) => {
  bot.sendMessage(`Hello there, ${params.user}`);
});
```

