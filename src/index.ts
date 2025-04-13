// import { rmSync } from 'fs';
import Client from '#structure/Client';
import { config } from 'dotenv';
import EventLoader from './loaders/EventLoader';
import ApplicationCommandLoader from './loaders/ApplicationCommandLoader';
import { CommandLoader } from './loaders/CommandLoader';
config();
const client = new Client();

Promise.all([
    EventLoader(client),
    ApplicationCommandLoader(client),
    CommandLoader(client)
]).then(() => client.login(process.env.DISCORD_TOKEN));

process.on('uncaughtException', client.console.error);
process.on('unhandledRejection', client.console.error);

// process.once('exit', () => {
//     client.destroy();
//     rmSync('dist/', { force: true, recursive: true });
// });
