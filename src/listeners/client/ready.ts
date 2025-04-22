import { Client, Events } from 'discord.js';
import Listener from '#structure/Listener';
import { loadersConfig } from '../../config';

export default class Ready extends Listener {
    constructor() {
        super({
            event: Events.ClientReady
        });
    }
    // @ts-ignore
    public override async run(client: Client) {
        const { tag, id } = client.user!;
        client.console.info('Ready!');
        client.console.info(`Logged in as ${tag} [${id}]`);
        loaderTable(client);
        return;
    }
}

function loaderTable(client: Client) {
    const loaderTable: Array<{ Typed: string; Loaded: number; Items: string }> =
        [];

    if (loadersConfig.eventLoader) {
        loaderTable.push({
            Typed: 'EventLoader',
            Loaded: client.eventListeners.size,
            Items: client.eventListeners.map((x) => x.name).join(', ')
        });
    }

    if (loadersConfig.messageCommandLoader) {
        loaderTable.push({
            Typed: 'Command',
            Loaded: client.commands.size,
            Items: client.commands.map((x) => x.name).join(', ')
        });
    }
    if (loadersConfig.interactionCommandLoader) {
        if (!loaderTable.find((x) => x.Typed === 'Command'))
            loaderTable.push({
                Typed: 'Command',
                Loaded: client.commands.size,
                Items: client.commands.map((x) => x.name).join(', ')
            });
    }

    console.table(loaderTable);
}
