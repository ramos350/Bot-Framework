# Command Conditions System

This directory contains condition classes that restrict command execution based on various criteria. The system uses TypeScript's declaration merging to provide IntelliSense similar to Sapphire's precondition system.

## 📋 Overview

The conditions system allows you to:

- Create reusable checks that run before commands execute
- Apply multiple conditions to any command
- Get proper IntelliSense in your editor when specifying conditions
- Add new conditions without updating a central registry

## 🔧 Using Conditions

To apply conditions to your commands:

```typescript
import Command from '../../structures/Command';

export default new Command({
    name: 'mycommand',
    description: 'My command description',
    // Add conditions - you'll get IntelliSense here
    conditions: [
        'GuildOnly',  // Only works in servers
        'BotOwnerOnly' // Only works for bot owners
    ],
    // Rest of your command configuration...
    
    async chatInputRun(interaction) {
        // This code only runs if all conditions pass
    }
});
```

## 🛠️ Creating Custom Conditions

To create a new condition:

1. Create a new file in the `conditions` directory (e.g., `MyCondition.ts`)
2. Extend the `Condition` base class and implement the required methods
3. Add the declaration for TypeScript support

### Template:

```typescript
import { Condition } from '../structures/Condition';
import Result from '../lib/Result';
import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    Message
} from 'discord.js';

// Add this to register your condition for IntelliSense
declare global {
    namespace Framework {
        interface Conditions {
            MyCondition: never; // The name must match your condition class name
        }
    }
}

/**
 * Description of what your condition does
 */
export default class MyCondition extends Condition {
    // Message command check
    messageRun(msg: Message): Result {
        // Your condition logic here
        return Result.ok(); // Pass condition
        // OR
        // return Result.reason('Error message'); // Fail with reason
    }

    // Slash command check
    chatInputRun(ctx: ChatInputCommandInteraction): Result {
        // Your condition logic here
        return Result.ok();
    }

    // Context menu check
    contextMenuRun(ctx: ContextMenuCommandInteraction): Result {
        // Your condition logic here
        return Result.ok();
    }
}
```

## ✨ How It Works

The system uses TypeScript's declaration merging and module augmentation to automatically register condition names for IntelliSense:

1. Each condition file declares itself in the `Framework.Conditions` interface
2. The command system extracts condition names from this interface
3. TypeScript automatically provides type checking and IntelliSense

When a command runs, the system:
1. Checks if the command has conditions
2. Runs each condition in sequence
3. If any condition fails, prevents the command from executing

## 📚 Available Conditions

- `GuildOnly`: Command can only be used in a guild (server)
- `BotOwnerOnly`: Command can only be used by the bot owner
- `AdminOnly`: Command can only be used by users with Administrator permissions

## 🔄 Result System

Conditions use a Result system that can either:

- Pass with `Result.ok()`
- Fail with `Result.reason('Reason for failure')`

Failed conditions display appropriate error messages to users. 