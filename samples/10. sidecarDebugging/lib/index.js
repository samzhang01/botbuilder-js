"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_rules_1 = require("botbuilder-rules");
const botbuilder_core_1 = require("botbuilder-core");
const { MemoryStorage } = require('botbuilder-core');
const restify = require('restify');
const { default: chalk } = require('chalk');
const { BotFrameworkAdapter } = require('botbuilder');
const { EmulatorAwareBot } = require('./bot');
const memoryStorage = new MemoryStorage();
// Create conversation state with in-memory storage provider.
const conversationState = new botbuilder_core_1.ConversationState(memoryStorage);
const bot = new EmulatorAwareBot(conversationState);
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
});
if (process.env.NODE_ENV === 'development') {
    new botbuilder_rules_1.BotDebugger(memoryStorage, adapter);
}
const server = restify.createServer();
server.listen(process.env.PORT, () => {
    process.stdout.write(`Bot is listening on port: ${chalk.blue(server.address().port)}`);
});
server.post('/api/messages', (req, res) => {
    return adapter.processActivity(req, res, bot.onTurn.bind(bot)).catch(res.error);
});
//# sourceMappingURL=index.js.map