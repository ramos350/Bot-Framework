import { ApplicationCommandData, Client, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { clientId, loadersConfig } from '../config';

export default async function ApplicationCommandLoader(client: Client) {
    if (!loadersConfig.interactionCommandLoader) return;
    client.console.info('Initializing Application Command Registry..');

    const globalCommands: ApplicationCommandData[] = [];
    const guildCommandsMap = new Map<string, ApplicationCommandData[]>();

    const dirs = readdirSync('dist/commands');
    for (const dir of dirs) {
        const files = readdirSync(`dist/commands/${dir}`).filter((x) =>
            x.endsWith('.js')
        );
        for (const file of files) {
            const { default: command } = await import(
                `../commands/${dir}/${file}`
            );

            if (!command || !command.applicationCommand) continue;

            if (
                command.applicationCommand &&
                !(command.chatInputRun && command.contextMenuRun)
            ) {
                client.console.warn(
                    `Command ${command.name} is missing chatInputRun or contextMenuRun method. Skipping registration.`
                );
                continue;
            }

            const commandData = command.applicationCommand.toJSON();

            if (command.guilds && Array.isArray(command.guilds)) {
                for (const guildId of command.guilds) {
                    const list = guildCommandsMap.get(guildId) || [];
                    list.push(commandData);
                    guildCommandsMap.set(guildId, list);
                }
            } else {
                globalCommands.push(commandData);
            }
        }
    }

    const rest = new REST({ version: '10' }).setToken(
        process.env.DISCORD_TOKEN!
    );

    try {
        if (globalCommands.length > 0) {
            const data = await rest.put(Routes.applicationCommands(clientId), {
                body: globalCommands
            });
            client.console.info(
                `Global commands registered: ${(data as any[]).length}`
            );
        }

        for (const [guildId, commands] of guildCommandsMap.entries()) {
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                {
                    body: commands
                }
            );
            client.console.info(
                `Guild (${guildId}) commands registered: ${(data as any[]).length}`
            );
        }

        client.console.info('Application Command Registry finished.');
    } catch (error) {
        client.console.error('Failed to register commands:', error);
    }
    client.console.info(`Loaded ${globalCommands.length} global commands`);
    client.console.info(`Loaded ${guildCommandsMap.size} guild commands`);
}
