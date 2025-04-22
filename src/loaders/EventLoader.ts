import { Client, Events } from 'discord.js';
import { readdirSync, statSync } from 'fs';
import path from 'path';
import Result from '#lib/Result';
import { loadersConfig } from '../config';

type RunMethod = (...args: any[]) => Promise<any> | any;

export default async function loadEvents(client: Client): Promise<void> {
    if (!loadersConfig.eventLoader) return;

    let loadedCount = 0;

    const findRunMethod = (obj: any): RunMethod | null => {
        if (!obj) return null;
        if (typeof obj.run === 'function') return obj.run;

        if (obj._options && typeof obj._options.run === 'function') {
            return obj._options.run.bind(obj);
        }
        if (obj.options && typeof obj.options.run === 'function') {
            return obj.options.run.bind(obj);
        }

        const proto = Object.getPrototypeOf(obj);
        if (proto && proto !== Object.prototype) {
            const protoRun = findRunMethod(proto);
            if (protoRun) return protoRun.bind(obj);
        }

        return null;
    };

    const loadListenersFromDirectory = async (
        directory: string
    ): Promise<void> => {
        try {
            const entries = readdirSync(directory);

            for (const entry of entries) {
                const fullPath = path.join(directory, entry);
                const stats = statSync(fullPath);

                if (stats.isDirectory()) {
                    await loadListenersFromDirectory(fullPath);
                    continue;
                }

                if (!entry.endsWith('.js')) continue;

                const relativePath = path
                    .relative('dist', fullPath)
                    .replace(/\\/g, '/');

                const fileName = path.basename(entry, '.js');

                try {
                    const { default: importedModule } = await import(
                        `../${relativePath}`
                    );

                    const potentialListeners: any[] = [];

                    if (importedModule.default) {
                        potentialListeners.push({
                            exported: importedModule.default,
                            exportName: 'default'
                        });
                    }

                    Object.entries(importedModule).forEach(([key, value]) => {
                        if (
                            key !== 'default' &&
                            ((typeof value === 'function' && value.prototype) ||
                                (typeof value === 'object' && value !== null))
                        ) {
                            potentialListeners.push({
                                exported: value,
                                exportName: key
                            });
                        }
                    });

                    if (potentialListeners.length === 0) {
                        client.console.warn(
                            `No suitable exports found in ${fullPath}`
                        );
                        continue;
                    }

                    for (const { exported, exportName } of potentialListeners) {
                        let listener;

                        if (typeof exported === 'function') {
                            try {
                                listener = new exported();
                            } catch (error) {
                                client.console.warn(
                                    `Could not instantiate class from ${exportName} export in ${fullPath}: ${error}`
                                );
                                continue;
                            }
                        } else {
                            listener = exported;
                        }

                        const eventValue = listener.event;
                        if (!eventValue) {
                            client.console.debug(
                                `No event property in ${exportName} from ${fullPath}`
                            );
                            continue;
                        }

                        const runMethod = findRunMethod(listener);
                        if (!runMethod) {
                            client.console.debug(
                                `No run method found in ${exportName} from ${fullPath}`
                            );
                            continue;
                        }

                        let name;

                       if (listener.name) {
                            name = listener.name;
                        } else if (
                            typeof exported === 'function' &&
                            exported.name &&
                            !['Object', 'default', 'Listener'].includes(
                                exported.name
                            )
                        ) {
                            name = exported.name;
                        } else if (exportName !== 'default') {
                            name = exportName;
                        } else if (
                            listener.constructor &&
                            listener.constructor.name &&
                            !['Object', 'Listener'].includes(
                                listener.constructor.name
                            )
                        ) {
                            name = listener.constructor.name;
                        } else {
                            name = fileName
                                .split(/[-_]/)
                                .map(
                                    (part) =>
                                        part.charAt(0).toUpperCase() +
                                        part.slice(1)
                                )
                                .join('');
                        }

                        const handler = async (
                            ...args: any[]
                        ): Promise<void> => {
                            try {
                                let shouldRun = true;

                                if (typeof listener.parse === 'function') {
                                    const context = {
                                        ok: Result.ok,
                                        none: Result.none
                                    };
                                    const result = await listener.parse.apply(
                                        context,
                                        args
                                    );
                                    shouldRun = result?.ok === true;
                                }

                                if (shouldRun) {
                                    if (eventValue === Events.ClientReady) {
                                        await runMethod.call(
                                            listener,
                                            client,
                                            ...args
                                        );
                                    } else {
                                        await runMethod.apply(listener, args);
                                    }
                                }
                            } catch (error) {
                                client.console.error(
                                    `Error in listener "${name}":`,
                                    error
                                );
                            }
                        };

                        const once = listener.once ?? false;
                        if (once) {
                            client.once(eventValue, handler);
                        } else {
                            client.on(eventValue, handler);
                        }

                        client.eventListeners.set(name, {
                            name,
                            event: eventValue,
                            once,
                            run: runMethod as any,
                            parse: listener.parse
                        });

                        loadedCount++;
                        client.console.debug(
                            `Loaded listener: ${name} (${exportName}) for event ${eventValue}`
                        );
                    }
                } catch (error) {
                    client.console.error(
                        `Failed to load listener from ${fullPath}:`,
                        error
                    );
                }
            }
        } catch (error) {
            client.console.error(
                `Error reading directory ${directory}:`,
                error
            );
        }
    };

    await loadListenersFromDirectory('dist/listeners');

    client.console.info(`Loaded ${loadedCount} event listeners`);
}
