import { Client, Events } from 'discord.js';
import { readdirSync, statSync } from 'fs';
import path from 'path';
import Result from '../lib/Result';
import { loadersConfig } from '../config';

export default async function (client: Client) {
    if (!loadersConfig.eventLoader) return;
    let count = 0;

    const loadFolder = async (dir: string) => {
        const entries = readdirSync(dir);
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stats = statSync(fullPath);

            if (stats.isDirectory()) {
                await loadFolder(fullPath);
                continue;
            }

            if (!entry.endsWith('.js')) continue;

            const relativePath = path
                .relative('dist', fullPath)
                .replace(/\\/g, '/');

            const { default: importedModule } = await import(
                `../${relativePath}`
            );
            const eventModule = importedModule.default;
            if (!eventModule || typeof eventModule.run !== 'function') continue;
            const once = eventModule.once ?? false;
            const eventName = eventModule.event;
            if (!eventName) continue;

            const exportedClassName =
                eventModule.constructor?.name &&
                eventModule.constructor.name !== 'Object'
                    ? eventModule.constructor.name
                    : undefined;

            const fileName = path.basename(entry, '.js');

            const name = eventModule.name ?? exportedClassName ?? fileName;

            const handler = async (...args: any[]) => {
                try {
                    let shouldRun = true;

                    if (typeof eventModule.parse === 'function') {
                        const context = {
                            ok: Result.ok,
                            none: Result.none
                        };
                        const result = await eventModule.parse.apply(
                            context,
                            args
                        );
                        shouldRun = result?.ok === true;
                    }

                    if (shouldRun) {
                        if (eventModule.event === Events.ClientReady) await eventModule.run(client, ...args);
                        else await eventModule.run(...args);
                    }
                } catch (err) {
                    client.console.error(`Error in event "${name}":`, err);
                }
            };

            if (once) {
                client.once(eventName, handler);
            } else {
                client.on(eventName, handler);
            }

            client.eventListeners.set(name, {
                name,
                event: eventName,
                once,
                run: eventModule.run,
                parse: eventModule.parse
            });

            count++;
        }
    };

    await loadFolder('dist/listeners');
    client.console.info(`Listening to ${client.eventListeners.size} events`);
}
