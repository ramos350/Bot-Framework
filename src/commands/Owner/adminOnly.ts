import { SlashCommandBuilder } from 'discord.js';
import Command from '../../structures/Command';

export default new Command({
    name: 'adminpanel',
    description: 'Access the admin panel (example of multiple conditions)',
    conditions: ['GuildOnly', 'BotOwnerOnly'], // TypeScript will recognize these as valid conditions
    applicationCommand: new SlashCommandBuilder()
        .setName('adminpanel')
        .setDescription('Access the admin panel (requires bot owner and server)'),
    
    async chatInputRun(interaction) {
        // This will only run if all conditions pass
        await interaction.reply({
            content: 'Welcome to the admin panel! This is a restricted area.',
            ephemeral: true
        });
    }
}); 