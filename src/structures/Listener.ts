import { ClientEvents } from 'discord.js';
import Result from '../lib/Result';

export default interface Listener<
    K extends keyof ClientEvents = keyof ClientEvents
> {
    name?: string;
    event: K;
    once?: boolean;

    parse?: (...args: ClientEvents[K]) => Result | Promise<Result>;
    run: (...args: ClientEvents[K]) => any | Promise<any>;
}