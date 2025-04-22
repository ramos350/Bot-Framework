import type { ClientEvents } from 'discord.js';
import Result from '#lib/Result';

type ListenerBase<K extends keyof ClientEvents> = {
  name?: string;
  once?: boolean;
  parse?: (...args: ClientEvents[K]) => Result | Promise<Result>;
  run: (...args: ClientEvents[K]) => any | Promise<any>;
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
 */
export default class Listener<K extends keyof ClientEvents = keyof ClientEvents> {
  public readonly name?: string;
  public readonly event: K;
  public readonly once: boolean;

  public readonly parse?: (...args: ClientEvents[K]) => Result | Promise<Result>;
  public readonly run: (...args: ClientEvents[K]) => any | Promise<any>;

  constructor(options: K extends keyof ClientEvents ? WithGeneric<K> : never);
  constructor(options: WithoutGeneric);
  constructor(options: any) {
    this.name = options.name;
    this.once = options.once ?? false;
    this.parse = options.parse;
    this.run = options.run;

    // Force event to exist at runtime
    if (!options.event) {
      throw new Error('Listener must have an "event" either via generic or event prop.');
    }

    this.event = options.event;
  }
}
