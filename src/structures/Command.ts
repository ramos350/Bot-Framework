import { loadConditions, runConditions, type ConditionName } from '../lib/conditions';
import type {
    Message,
    CommandInteraction,
    ChatInputCommandInteraction,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    PermissionResolvable,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    AutocompleteInteraction
} from 'discord.js';

/**
 * Command handler result type for condition checks
 */
interface ConditionResult {
    success: boolean;
    error?: string;
}

/**
 * A command definition usable for both message and interaction-based handling.
 */
export default class Command {
    /**
     * Command name - used for execution and reference
     */
    public readonly name: string;
    
    /**
     * Command description
     */
    public readonly description?: string;
    
    /**
     * Command aliases - alternative ways to trigger the command
     */
    public readonly aliases?: string[];
    
    /**
     * Permissions the client needs to execute this command
     */
    public readonly clientPermissions?: PermissionResolvable;
    
    /**
     * Permissions the user needs to execute this command
     */
    public readonly userPermissions?: PermissionResolvable;
    
    /**
     * Command category for organizational purposes
     */
    public readonly category?: string;
    
    /**
     * Cooldown in seconds between command uses
     */
    public readonly cooldown?: number;
    
    /**
     * Slash command or context menu configuration
     */
    public readonly applicationCommand?:
        | SlashCommandBuilder
        | ContextMenuCommandBuilder;
    
    /**
     * Whether this command is restricted to bot owners
     */
    public readonly ownerOnly: boolean;
    
    /**
     * Guild IDs where this command is allowed
     */
    public readonly guilds?: string[];
    
    /**
     * Conditions that must be satisfied to run this command
     * Uses declaration merging for IntelliSense
     */
    public readonly conditions?: ConditionName[];

    /**
     * Handler for message-based command execution
     */
    public readonly messageRun?: (
        msg: Message,
        args?: string[]
    ) => Promise<unknown>;
    
    /**
     * Handler for slash command execution
     */
    public readonly chatInputRun?: (
        ctx: ChatInputCommandInteraction | CommandInteraction
    ) => Promise<unknown>;
    
    /**
     * Handler for context menu command execution
     */
    public readonly contextMenuRun?: (
        ctx:
            | UserContextMenuCommandInteraction
            | MessageContextMenuCommandInteraction
            | CommandInteraction
    ) => Promise<unknown>;
    
    /**
     * Handler for autocomplete interactions
     */
    public readonly autocompleteRun?: (
        ctx: AutocompleteInteraction
    ) => Promise<unknown>;

    /**
     * Create a new command
     * @param options Command configuration
     */
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
        conditions?: ConditionName[];

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
        this.conditions = options.conditions;

        this.messageRun = options.messageRun;
        this.chatInputRun = options.chatInputRun;
        this.contextMenuRun = options.contextMenuRun;
        this.autocompleteRun = options.autocompleteRun;
    }

    /**
     * Get all registered conditions 
     * @returns Record of available conditions
     */
    static getAvailableConditions(): Record<string, any> {
        return loadConditions();
    }

    /**
     * Run all conditions for this command
     * @param context The context to check conditions against
     * @param type The type of context (message, chatInput, contextMenu)
     * @returns Result indicating if conditions passed and any error messages
     */
    async runConditions(
        context: any,
        type: 'message' | 'chatInput' | 'contextMenu'
    ): Promise<ConditionResult> {
        return runConditions(this.conditions, context, type);
    }
}
