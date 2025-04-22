/**
 * This file defines the type for condition names
 * Add new conditions to the union type below
 */

// For proper IntelliSense, define all condition names as a union type
export type ConditionName = 
    | 'GuildOnly' 
    | 'BotOwnerOnly'
    | 'AdminOnly'; 