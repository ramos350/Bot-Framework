import { Condition } from '../structures/Condition';
import Result from '../lib/Result';
import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    Message,
    PermissionFlagsBits
} from 'discord.js';

// Augment the Framework.Conditions interface with this condition
declare global {
    namespace Framework {
        interface Conditions {
            AdminOnly: never;
        }
    }
}

/**
 * Condition that only allows users with Administrator permission to use commands
 */
export default class AdminOnly extends Condition {
    messageRun(msg: Message): Result {
        if (!msg.guild) return Result.reason('This command can only be used in servers');
        if (!msg.member) return Result.reason('Could not resolve member permissions');
        
        return msg.member.permissions.has(PermissionFlagsBits.Administrator)
            ? Result.ok()
            : Result.reason('This command requires Administrator permission');
    }

    chatInputRun(ctx: ChatInputCommandInteraction): Result {
        if (!ctx.guild) return Result.reason('This command can only be used in servers');
        if (!ctx.memberPermissions) return Result.reason('Could not resolve member permissions');
        
        return ctx.memberPermissions.has(PermissionFlagsBits.Administrator)
            ? Result.ok()
            : Result.reason('This command requires Administrator permission');
    }

    contextMenuRun(ctx: ContextMenuCommandInteraction): Result {
        if (!ctx.guild) return Result.reason('This command can only be used in servers');
        if (!ctx.memberPermissions) return Result.reason('Could not resolve member permissions');
        
        return ctx.memberPermissions.has(PermissionFlagsBits.Administrator)
            ? Result.ok()
            : Result.reason('This command requires Administrator permission');
    }
} 