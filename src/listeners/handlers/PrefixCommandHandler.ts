import {
    Events,
    OmitPartialGroupDMChannel,
    type Message,
    type TextChannel
} from 'discord.js';
import { loadersConfig, owners } from '../../config';
import { doPermissionCheck } from '#lib/utils';
import type Command from '#structure/Command';
import Listener from '#structure/Listener';
import Result from '#lib/Result';

export default class PrefixCommandHandler extends Listener {
    public constructor() {
        super({
            event: Events.MessageCreate,
            parse: async (msg: Message) => {
                if (!loadersConfig.messageCommandLoader) return Result.none();
                if (!msg.author || msg.author.bot || msg.author.system)
                    return Result.none();
                if (!msg.content.startsWith(msg.client.prefix))
                    return Result.none();
                return Result.ok();
            }
        });
    }
    public override async run(msg: OmitPartialGroupDMChannel<Message>) {
        const cooldowns = msg.client.cooldowns;
        const args = msg.content.slice(msg.client.prefix.length).split(/ +/g);
        const c = args.shift();

        if (!c) return;

        const command = (msg.client.commands.get(c) ||
            msg.client.commands.find(
                (x) => x.aliases && x.aliases.includes(c)
            )) as Command;

        if (!command) return;
        if (!command.messageRun) return;

        try {
            if (
                command.guilds &&
                msg.guild &&
                !command.guilds.some((x) => x === msg.guild?.id)
            ) {
                msg.reply({
                    content: 'Cannot use this command in this context!'
                });
                return;
            }

            if (command.ownerOnly && !owners.includes(msg.author.id)) {
                msg.reply({
                    content: 'Command is restricted to owner-only command!'
                });
                return;
            }

            // Run conditions if any are defined
            if (command.conditions && command.conditions.length > 0) {
                const result = await command.runConditions(msg, 'message');
                if (!result.success) {
                    msg.reply({
                        content: result.error || 'You cannot use this command.'
                    });
                    return;
                }
            }

            if (command.cooldown) {
                const now = Date.now();
                const timestamps = cooldowns.get(command.name) || new Map();
                const expirationTime = timestamps.get(msg.author.id) || 0;

                if (now < expirationTime) {
                    const remaining = Math.ceil((expirationTime - now) / 1000);
                    await msg.reply({
                        content: `You must wait ${remaining} more second(s) before reusing this command.`
                    });
                    return;
                }

                timestamps.set(msg.author.id, now + command.cooldown * 1000);
                cooldowns.set(command.name, timestamps);
            }

            if (
                command.clientPermissions &&
                !doPermissionCheck(
                    msg.channel as TextChannel,
                    msg.guild?.members.me!,
                    command.clientPermissions
                )
            ) {
                msg.reply({
                    content: `I'm missing the ${command.userPermissions} permission`
                });
                return;
            }

            if (
                command.userPermissions &&
                !doPermissionCheck(
                    msg.channel as TextChannel,
                    msg.member!,
                    command.userPermissions
                )
            ) {
                msg.reply({
                    content: `Missing ${command.userPermissions} Permission`
                });
                return;
            }
            await command.messageRun(msg, args);
        } catch (error) {
            msg.reply('An error occurred');
            msg.client.console.error(error);
        }
    }
}
