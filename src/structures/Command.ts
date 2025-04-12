import type {
    Message,
    CommandInteraction,
    ChatInputCommandInteraction,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    PermissionResolvable,
    SlashCommandBuilder,
    ContextMenuCommandBuilder
} from 'discord.js';

export default interface Command {
    name: string;
    description?: string;
    aliases?: string[];
    clientPermissions?: PermissionResolvable;
    userPermissions?: PermissionResolvable;
    category?: string;
    cooldown?: number | 1000;
    applicationCommand?: SlashCommandBuilder | ContextMenuCommandBuilder;
    ownerOnly?: boolean | false;
    guilds?: string[];

    messageRun?: (msg: Message, args?: string[]) => Promise<unknown>;
    chatInputRun?: (
        ctx: ChatInputCommandInteraction | CommandInteraction
    ) => Promise<unknown>;
    contextMenuRun?: (
        ctx:
            | UserContextMenuCommandInteraction
            | MessageContextMenuCommandInteraction
            | CommandInteraction
    ) => Promise<unknown>;
}
