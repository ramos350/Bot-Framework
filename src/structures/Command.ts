import { loadConditions } from '#lib/conditions';
import type {
    Message,
    CommandInteraction,
    ChatInputCommandInteraction,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    PermissionResolvable,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    AutocompleteInteraction,
  } from 'discord.js';
  
  type ConditionKey = string;

  /**
   * A command definition usable for both message and interaction-based handling.
   */
  export default class Command {
    public readonly name: string;
    public readonly description?: string;
    public readonly aliases?: string[];
    public readonly clientPermissions?: PermissionResolvable;
    public readonly userPermissions?: PermissionResolvable;
    public readonly category?: string;
    public readonly cooldown?: number;
    public readonly applicationCommand?:
      | SlashCommandBuilder
      | ContextMenuCommandBuilder;
    public readonly ownerOnly: boolean;
    public readonly guilds?: string[];
    public readonly conditions?: ConditionKey[]; // New conditions property
  
    public readonly messageRun?: (msg: Message, args?: string[]) => Promise<unknown>;
    public readonly chatInputRun?: (
      ctx: ChatInputCommandInteraction | CommandInteraction
    ) => Promise<unknown>;
    public readonly contextMenuRun?: (
      ctx:
        | UserContextMenuCommandInteraction
        | MessageContextMenuCommandInteraction
        | CommandInteraction
    ) => Promise<unknown>;
    public readonly autocompleteRun?: (
      ctx: AutocompleteInteraction
    ) => Promise<unknown>;
  
    constructor(options: {
      name: string;
      description?: string;
      aliases?: string[];
      clientPermissions?: PermissionResolvable;
      userPermissions?: PermissionResolvable;
      category?: string;
      cooldown?: number;
      applicationCommand?: SlashCommandBuilder | ContextMenuCommandBuilder;
      ownerOnly?: boolean;
      guilds?: string[];
      conditions?: ConditionKey[]; // Accept conditions in the constructor
  
      messageRun?: (msg: Message, args?: string[]) => Promise<unknown>;
      chatInputRun?: (
        ctx: ChatInputCommandInteraction | CommandInteraction
      ) => Promise<unknown>;
      contextMenuRun?: (
        ctx:
          | UserContextMenuCommandInteraction
          | MessageContextMenuCommandInteraction
          | CommandInteraction
      ) => Promise<unknown>;
      autocompleteRun?: (ctx: AutocompleteInteraction) => Promise<unknown>;
    }) {
      this.name = options.name;
      this.description = options.description;
      this.aliases = options.aliases;
      this.clientPermissions = options.clientPermissions;
      this.userPermissions = options.userPermissions;
      this.category = options.category;
      this.cooldown = options.cooldown;
      this.applicationCommand = options.applicationCommand;
      this.ownerOnly = options.ownerOnly ?? false;
      this.guilds = options.guilds;
      this.conditions = options.conditions; // Set conditions
  
      this.messageRun = options.messageRun;
      this.chatInputRun = options.chatInputRun;
      this.contextMenuRun = options.contextMenuRun;
      this.autocompleteRun = options.autocompleteRun;
    }

    static getAvailableConditions(): Record<string, any> {
        return loadConditions();
      }
  }
  
  