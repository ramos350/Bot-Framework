import {
    CommandInteraction,
    Events,
    GuildMember,
    TextChannel
} from 'discord.js';
import { owners } from '../../config';
import { doPermissionCheck } from '#lib/utils';
import Listener from '#structure/Listener';
import Result from '#lib/Result';
import Command from '#structure/Command';

export default <Listener>{
    event: Events.InteractionCreate,
    parse: async (interaction: CommandInteraction) => {
        if (!interaction.isCommand()) return Result.none();
        if (!interaction.guild) return Result.none();
        if (!interaction.member || interaction.user.bot) return Result.none();
        if (interaction.user.system) return Result.none();

        const { commandName } = interaction;
        const command = interaction.client.commands.get(commandName);
        if (!command) return Result.none();

        return Result.ok();
    },
    run: async (interaction: CommandInteraction) => {
        const cooldowns = interaction.client.cooldowns;
        const { commandName } = interaction;
        const command = interaction.client.commands.get(commandName) as Command;

        if (command.ownerOnly && !owners.includes(interaction.user.id)) {
            interaction.reply({
                content: 'This command can only be used by the owners',
                ephemeral: true
            });
            return;
        }

        if (command.cooldown) {
            const now = Date.now();
            const timestamps = cooldowns.get(commandName) || new Map();
            const expirationTime = timestamps.get(interaction.user.id) || 0;

            if (now < expirationTime) {
                const remaining = Math.ceil((expirationTime - now) / 1000);
                interaction.reply({
                    content: `You must wait ${remaining} more second(s) before reusing this command.`,
                    ephemeral: true
                });
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
            interaction.reply({
                content: `I'm missing the ${command.clientPermissions} permission`,
                ephemeral: true
            });
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
            interaction.reply({
                content: `Missing ${command.userPermissions} Permission`,
                ephemeral: true
            });
            return;
        }

        try {
            if (interaction.isChatInputCommand() && command.chatInputRun) {
                await command.chatInputRun(interaction);
            } else if (
                interaction.isContextMenuCommand() &&
                command.contextMenuRun
            ) {
                await command.contextMenuRun(interaction);
            }
            if (interaction.isAutocomplete() && command.autocompleteRun) {
                await command.autocompleteRun(interaction);
            }
        } catch (error) {
            interaction.client.console.error(error);
        }
    }
};
