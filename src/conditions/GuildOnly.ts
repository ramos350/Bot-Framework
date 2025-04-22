import { Condition } from '../structures/Condition';
import Result from '../lib/Result';
import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    Message
} from 'discord.js';

// Augment the Framework.Conditions interface with this condition
declare global {
    namespace Framework {
        interface Conditions {
            GuildOnly: never;
        }
    }
}

/**
 * Condition that only allows commands to be used in guilds (servers)
 */
export default class GuildOnly extends Condition {
    messageRun(msg: Message): Result {
        return msg.guild ? Result.ok() : Result.reason('This command can only be used in servers');
    }

    chatInputRun(ctx: ChatInputCommandInteraction): Result {
        return ctx.guild ? Result.ok() : Result.reason('This command can only be used in servers');
    }

    contextMenuRun(ctx: ContextMenuCommandInteraction): Result {
        return ctx.guild ? Result.ok() : Result.reason('This command can only be used in servers');
    }
} 