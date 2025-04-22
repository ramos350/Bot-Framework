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
            BotOwnerOnly: never;
        }
    }
}

/**
 * Condition that only allows bot owners to use commands
 */
export default class BotOwnerOnly extends Condition {
    // You would typically get this from your config
    private ownerIds = ['YOUR_DISCORD_ID'];

    messageRun(msg: Message): Result {
        return this.ownerIds.includes(msg.author.id)
            ? Result.ok()
            : Result.reason('This command can only be used by the bot owner');
    }

    chatInputRun(ctx: ChatInputCommandInteraction): Result {
        return this.ownerIds.includes(ctx.user.id)
            ? Result.ok()
            : Result.reason('This command can only be used by the bot owner');
    }

    contextMenuRun(ctx: ContextMenuCommandInteraction): Result {
        return this.ownerIds.includes(ctx.user.id)
            ? Result.ok()
            : Result.reason('This command can only be used by the bot owner');
    }
} 