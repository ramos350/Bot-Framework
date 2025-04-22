import {
    ChatInputCommandInteraction,
    Events,
    // Events,
    GuildMember,
    Interaction,
    MessageContextMenuCommandInteraction,
    MessageFlags,
    TextChannel,
    UserContextMenuCommandInteraction
} from 'discord.js';
import { owners } from '../../config';
import { doPermissionCheck } from '#lib/utils';
import Listener from '#structure/Listener';
import Result from '#lib/Result';
import Command from '#structure/Command';

export default class InteractionCommandHandler extends Listener {
    constructor() {
        super({
            event: Events.InteractionCreate
        });
    }

    async parse(interaction: Interaction): Promise<Result> {
        if (!interaction.isCommand() && !interaction.isContextMenuCommand())
            return Result.none();
        if (!interaction.guild) return Result.none();
        if (!interaction.member || interaction.user.bot) return Result.none();
        if (interaction.user.system) return Result.none();

        const { commandName } = interaction;
        const command = interaction.client.commands.get(commandName);
        if (!command) return Result.none();

        return Result.ok();
    }

    async run(interaction: Interaction): Promise<void> {
        if (!interaction.isCommand() && !interaction.isContextMenuCommand())
            return;
        await this.deferable(interaction);
        const cooldowns = interaction.client.cooldowns;
        const { commandName } = interaction;
        const command = interaction.client.commands.get(commandName) as Command;

        if (command.ownerOnly && !owners.includes(interaction.user.id)) {
            await this.reply(
                interaction,
                'This command can only be used by the owners'
            );
            return;
        }

        // Run conditions if any are defined
        if (command.conditions && command.conditions.length > 0) {
            let result;
            if (interaction.isChatInputCommand()) {
                result = await command.runConditions(interaction, 'chatInput');
            } else if (interaction.isContextMenuCommand()) {
                result = await command.runConditions(interaction, 'contextMenu');
            }

            if (result && !result.success) {
                await this.reply(
                    interaction,
                    result.error || 'You cannot use this command.'
                );
                return;
            }
        }

        if (command.cooldown) {
            const now = Date.now();
            const timestamps = cooldowns.get(commandName) || new Map();
            const expirationTime = timestamps.get(interaction.user.id) || 0;

            if (now < expirationTime) {
                const remaining = Math.ceil((expirationTime - now) / 1000);
                await this.reply(
                    interaction,
                    `You must wait ${remaining} more second(s) before reusing this command.`
                );
                return;
            }

            timestamps.set(interaction.user.id, now + command.cooldown);
            cooldowns.set(commandName, timestamps);
        }

        if (
            command.clientPermissions &&
            !doPermissionCheck(
                interaction.channel as TextChannel,
                interaction.guild!.members.me!,
                command.clientPermissions
            )
        ) {
            await this.reply(
                interaction,
                `I'm missing the ${command.clientPermissions} permission`
            );
            return;
        }

        if (
            command.userPermissions &&
            !doPermissionCheck(
                interaction.channel as TextChannel,
                (interaction.member as GuildMember)!,
                command.userPermissions
            )
        ) {
            await this.reply(
                interaction,
                `Missing ${command.userPermissions} Permission`
            );
            return;
        }

        try {
            if (interaction.isChatInputCommand() && command.chatInputRun) {
                await command.chatInputRun(interaction);
            }
            if (interaction.isContextMenuCommand() && command.contextMenuRun) {
                await command.contextMenuRun(interaction);
            }
            if (interaction.isAutocomplete() && command.autocompleteRun) {
                await command.autocompleteRun(interaction);
            }
        } catch (error) {
            interaction.client.console.error(error);
        }
    }

    private async deferable(
        interaction:
            | ChatInputCommandInteraction
            | MessageContextMenuCommandInteraction
            | UserContextMenuCommandInteraction
    ): Promise<any> {
        if (interaction.deferred || interaction.replied) return;

        return await interaction.deferReply({
            flags: [MessageFlags.Ephemeral]
        });
    }

    private async reply(
        interaction:
            | ChatInputCommandInteraction
            | MessageContextMenuCommandInteraction
            | UserContextMenuCommandInteraction,
        content: string
    ): Promise<any> {
        const flags: any[] = [MessageFlags.Ephemeral];

        if (interaction.replied || interaction.deferred) {
            try {
                return await interaction.editReply({
                    content: content,
                    flags
                });
            } catch (error) {
                return await interaction.followUp({
                    content: content,
                    flags
                });
            }
        } else {
            return await interaction.reply({
                content: content,
                flags
            });
        }
    }
}
