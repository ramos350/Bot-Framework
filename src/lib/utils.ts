import { GuildMember, PermissionResolvable, TextChannel } from 'discord.js';

export const doPermissionCheck = (
    channel: TextChannel,
    member: GuildMember,
    permission: PermissionResolvable
): boolean => {
    if (channel.permissionsFor(member!).has(permission)) return true;
    if (member!.permissions.has(permission)) return true;
    return false;
};

export function clean(text: string): string {
    const dir = __dirname.split('\\');
    for (let i = 0; i < 3; ++i) dir.pop();
    return text
        .replace(/`/g, '`' + String.fromCharCode(8203))
        .replace(/@/g, '@' + String.fromCharCode(8203))
        .replaceAll('```', '\\`\\`\\`')
        .replaceAll(dir.join('\\'), '...\\user');
}
