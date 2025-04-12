import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { owners } from '../../config';
import { doPermissionCheck } from '../../lib/utils';

export default async function run(interaction: CommandInteraction) {
    if (!interaction.guild) return;
    const { commandName } = interaction;
    const command = interaction.client.commands.get(commandName);
    if (!command) return;
    if (command.ownerOnly && !owners.includes(interaction.user.id)) {
        interaction.reply({
            content: 'This command can only be used by the owners',
            ephemeral: true
        });
        return;
    }

    if (
        command.clientPermissions &&
        !doPermissionCheck(
            interaction.channel as TextChannel,
            interaction.guild.members.me!,
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
    if (interaction.isChatInputCommand()) {
        if (!command.chatInputRun) return;
        try {
            await command.chatInputRun(interaction);
        } catch (error) {
            interaction.client.console.error(error);
        }
    }

    if (interaction.isContextMenuCommand()) {
        if (!command.contextMenuRun) return;
        try {
            await command.contextMenuRun(interaction);
        } catch (error) {
            interaction.client.console.error(error);
        }
    }
}
