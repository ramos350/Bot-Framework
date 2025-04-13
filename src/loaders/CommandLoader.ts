import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { loadersConfig } from '../config';

export async function CommandLoader(client: Client) {
    if (!loadersConfig.messageCommandLoader) return;

    const dirs = readdirSync('dist/commands');
    for (const dir of dirs) {
        const files = readdirSync(`dist/commands/${dir}`).filter((x) =>
            x.endsWith('.js')
        );
        for (const file of files) {
            const { default: rawCommand } = await import(
                `../commands/${dir}/${file}`
            );
            let command;
            if (rawCommand.default) command = rawCommand.default;
            else command = rawCommand;
            if (!command) continue;
            if (!command || !command.name) continue;
            command.category = dir;
            client.commands.set(command.name, command);
        }
    }
    client.console.info(`Message commands loaded: ${client.commands.size}`);
}
