import {
    ActivityType,
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
} from 'discord.js';
import consola from 'consola';
import { prefix } from '../config';
import { config } from 'dotenv';
config();

export default class extends Client {
    public constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.User,
                Partials.Message
            ],
            presence: {
                activities: [
                    {
                        name: `${prefix}help`,
                        type: ActivityType.Listening
                    }
                ],
                status: 'online'
            }
        })
        this.console = consola
        this.commands = new Collection();
        this.eventListeners = new Collection();
        this.prefix = prefix;
    }
}