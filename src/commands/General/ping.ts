import { CommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import type Command from '../../structures/Command';

export default <Command>{
    name: 'ping',
    description: 'Latency of the bot',
    applicationCommand: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Latency of the bot'),
    messageRun: async (msg: Message) => {
        return msg.reply(`Ping! ${msg.client.ws.ping} ms`);
    },

    chatInputRun: async (ctx: CommandInteraction) => {
        ctx.reply(`Ping! ${ctx.client.ws.ping} ms`);
        return;
    }
};