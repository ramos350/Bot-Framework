import fs from 'fs';
import path from 'path';
import type { Condition } from '../structures/Condition';
import Result from './Result';

/**
 * Type that extracts condition names from the Framework.Conditions interface
 * This provides IntelliSense for condition names in commands
 */
export type ConditionName = keyof Framework.Conditions;

/**
 * ConditionManager - Handles loading, caching, and executing conditions
 */
class ConditionManager {
    /** Cache for loaded conditions to avoid repeated file system access */
    private conditionsCache: Map<string, Condition> = new Map();
    
    /** Path to the conditions directory */
    private conditionsPath: string = path.join(__dirname, '../conditions');
    
    /**
     * Load all conditions from the conditions directory
     * @returns A Map of condition names to condition instances
     */
    public loadAll(): Map<string, Condition> {
        // Return cache if already populated
        if (this.conditionsCache.size > 0) {
            return this.conditionsCache;
        }
        
        try {
            // Ensure the directory exists
            if (!fs.existsSync(this.conditionsPath)) {
                return this.conditionsCache;
            }
            
            // Get all files in the conditions directory
            const files = fs.readdirSync(this.conditionsPath);
            
            // Load each condition file
            for (const file of files) {
                // Skip non-code files and README
                if (!(file.endsWith('.ts') || file.endsWith('.js')) || 
                    file.includes('README') || 
                    file.includes('.d.ts')) {
                    continue;
                }
                
                // Extract condition name from filename
                const conditionName = file.replace(/\.(ts|js)$/, '');
                
                try {
                    // Dynamically import the condition
                    const conditionModule = require(
                        path.join(this.conditionsPath, file)
                    ).default;
                    
                    // Add to cache
                    this.conditionsCache.set(conditionName, conditionModule);
                } catch (error) {
                    console.error(`Failed to load condition: ${conditionName}`, error);
                }
            }
            
            return this.conditionsCache;
        } catch (error) {
            console.error('Failed to load conditions:', error);
            return this.conditionsCache;
        }
    }
    
    /**
     * Get a specific condition by name
     * @param name - The name of the condition to get
     * @returns The condition instance or undefined if not found
     */
    public get(name: string): Condition | undefined {
        const conditions = this.loadAll();
        return conditions.get(name);
    }
    
    /**
     * Run a series of conditions against a context
     * @param conditions - Array of condition names to run
     * @param context - The context to run the conditions against
     * @param type - The type of context (message, chatInput, contextMenu)
     * @returns A result object with success status and optional error message
     */
    public async run(
        conditions: ConditionName[] | undefined,
        context: any,
        type: 'message' | 'chatInput' | 'contextMenu'
    ): Promise<{success: boolean; error?: string}> {
        // If no conditions, succeed by default
        if (!conditions || conditions.length === 0) {
            return { success: true };
        }
        
        // Load all conditions
        const availableConditions = this.loadAll();
        
        // Run each condition in sequence
        for (const conditionName of conditions) {
            const condition = availableConditions.get(conditionName as string);
            
            // Handle missing condition
            if (!condition) {
                return { 
                    success: false, 
                    error: `Condition "${conditionName}" not found` 
                };
            }
            
            try {
                // Run the appropriate method based on context type
                let result: Result;
                
                switch (type) {
                    case 'message':
                        result = await condition.messageRun(context);
                        break;
                    case 'chatInput':
                        result = await condition.chatInputRun(context);
                        break;
                    case 'contextMenu':
                        result = await condition.contextMenuRun(context);
                        break;
                }
                
                // If condition fails, return failure with reason
                if (!result.ok) {
                    return { 
                        success: false, 
                        error: result.reason || `Condition "${conditionName}" failed` 
                    };
                }
            } catch (error) {
                // Handle errors in condition execution
                console.error(`Error running condition "${conditionName}":`, error);
                return {
                    success: false,
                    error: `Error executing condition "${conditionName}"`
                };
            }
        }
        
        // All conditions passed
        return { success: true };
    }
}

// Create singleton instance
const conditionManager = new ConditionManager();

/**
 * Load all available conditions
 * @returns A record of condition names to condition instances
 */
export function loadConditions(): Record<string, Condition> {
    const conditionsMap = conditionManager.loadAll();
    return Object.fromEntries(conditionsMap.entries());
}

/**
 * Run a series of conditions
 * @param conditions - Array of condition names to run
 * @param context - The context to run the conditions against
 * @param type - The type of context (message, chatInput, contextMenu)
 * @returns A result object with success status and optional error message
 */
export function runConditions(
    conditions: ConditionName[] | undefined,
    context: any,
    type: 'message' | 'chatInput' | 'contextMenu'
): Promise<{success: boolean; error?: string}> {
    return conditionManager.run(conditions, context, type);
}
