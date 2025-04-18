import consola from 'consola';
import type { Collection } from 'discord.js';
import type Command from '#structure/Command';
import Listener from '#structure/Listener';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
        }
    }
}

declare module 'discord.js' {
    interface Client {
        console: typeof consola;
        commands: Collection<string, Command>;
        eventListeners: Collection<string, Listener>;
        prefix: string;
        mongo: Database;
        cooldowns: Map<string, Map<string, number>>;
    }
}
