import { Client } from 'discord.js';

export default async function run(client: Client) {
    const { tag, id } = client.user!;
    client.console.info('Ready!');
    client.console.info(`Logged in as ${tag} [${id}]`);
    return;
}
