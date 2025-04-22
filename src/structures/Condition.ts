import Result from '#lib/Result';
import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    Message
} from 'discord.js';

/**
 * Abstract base class for command conditions/preconditions
 * Conditions are used to restrict command execution based on various criteria
 * 
 * To create a new condition:
 * 1. Create a new file in the conditions directory
 * 2. Extend this class and implement all required methods
 * 3. Add a declaration for IntelliSense support
 * 
 * Example:
 * ```typescript
 * declare global {
 *     namespace Framework {
 *         interface Conditions {
 *             YourConditionName: never;
 *         }
 *     }
 * }
 * ```
 */
export abstract class Condition {
    /**
     * Check condition for message commands
     * @param msg Message context to check against
     * @returns Result with ok=true if condition passes, or a reason for failure
     */
    abstract messageRun(msg: Message): Result | Promise<Result>;
    
    /**
     * Check condition for slash commands
     * @param ctx Interaction context to check against
     * @returns Result with ok=true if condition passes, or a reason for failure
     */
    abstract chatInputRun(
        ctx: ChatInputCommandInteraction
    ): Result | Promise<Result>;
    
    /**
     * Check condition for context menu commands
     * @param ctx Interaction context to check against
     * @returns Result with ok=true if condition passes, or a reason for failure
     */
    abstract contextMenuRun(
        ctx: ContextMenuCommandInteraction
    ): Result | Promise<Result>;
}
