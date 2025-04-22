import { SlashCommandBuilder } from 'discord.js';
import Command from '../../structures/Command';

export default new Command({
    name: 'serverinfo',
    description: 'Get information about the server',
    conditions: ['GuildOnly'],
    applicationCommand: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get information about the server'),
    
    async chatInputRun(interaction) {
        const { guild } = interaction;
        
        if (!guild) {
            return interaction.reply({ 
                content: 'This command can only be used in a server.',
                ephemeral: true
            });
        }
        
        // Get server info
        const serverInfo = {
            name: guild.name,
            id: guild.id,
            owner: (await guild.fetchOwner()).user.tag,
            memberCount: guild.memberCount,
            createdAt: guild.createdAt.toLocaleDateString(),
            roles: guild.roles.cache.size,
            channels: guild.channels.cache.size,
            emojis: guild.emojis.cache.size
        };
        
        const infoText = `
**Server Information: ${serverInfo.name}**
• ID: ${serverInfo.id}
• Owner: ${serverInfo.owner}
• Members: ${serverInfo.memberCount}
• Created: ${serverInfo.createdAt}
• Roles: ${serverInfo.roles}
• Channels: ${serverInfo.channels}
• Emojis: ${serverInfo.emojis}
        `.trim();
        
        return interaction.reply({ content: infoText });
    }
}); 