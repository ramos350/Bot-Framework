import type { ClientEvents } from 'discord.js';
import Result from '#lib/Result';

type ListenerBase<K extends keyof ClientEvents> = {
    name?: string;
    once?: boolean;
    parse?: (...args: ClientEvents[K]) => Result | Promise<Result>;
    run?: (...args: ClientEvents[K]) => any | Promise<any>;
};

// 1. With generic, event is optional
type WithGeneric<K extends keyof ClientEvents> = ListenerBase<K> & {
    event?: K;
};

// 2. Without generic, event is required
type WithoutGeneric = {
    [K in keyof ClientEvents]: ListenerBase<K> & { event: K };
}[keyof ClientEvents];

/**
 * A type-safe Discord.js event listener class.
 * Can be used either by instantiation with options or by extending the class.
 */
export default abstract class Listener<
    K extends keyof ClientEvents = keyof ClientEvents
> {
    public readonly name?: string;
    public readonly event!: K;
    public readonly once: boolean = false;

    /**
     * Create a listener by passing options
     */
    constructor(options: K extends keyof ClientEvents ? WithGeneric<K> : never);
    constructor(options: WithoutGeneric);
    constructor(options?: any) {
        // Support extending via classes
        if (!options && this.constructor !== Listener) {
            // Force event to exist at runtime
            if (!this.event) {
                throw new Error(
                    'Listener must have an "event" property when extending the class.'
                );
            }

            return;
        }

        // Support instantiation via options
        if (!options) {
            throw new Error(
                'Options must be provided when not extending the class.'
            );
        }

        this.name = options.name;
        this.once = options.once ?? false;

        // Force event to exist at runtime
        if (!options.event) {
            throw new Error(
                'Listener must have an "event" either via generic or event prop.'
            );
        }

        this.event = options.event;
    }

    /**
     * Parse the event arguments before running the listener.
     * Override this method in subclasses or provide via options.
     */
    public async parse?(...args: ClientEvents[K]): Promise<Result>;

    /**
     * Run the listener with the event arguments.
     * Override this method in subclasses or provide via options.
     */
    public async run?(...args: ClientEvents[K]): Promise<any>;
}
