import type { Message } from 'discord.js';
import type Command from '#structure/Command';
import { isThenable } from '#lib/isThenable';
import { inspect } from 'util';
import { clean } from '#lib/utils';
import parseCodeBlock from '#lib/codeBlockParser';

export default <Command>{
    name: 'eval',
    description: 'Evaluate a javascript code',
    ownerOnly: true,
    messageRun: async (msg: Message, args: string[] | undefined) => {
        if (!args || !args.length) {
            msg.reply({
                content: 'Please provide a code to eval!'
            });
            return;
        }

        const codeBlockParsed = parseCodeBlock(args.join(' '));
        const code = codeBlockParsed.code ?? args.join(' ');

        const { result, success } = await Eval(msg, code, {
            async: code.includes('await') || code.includes('return'),
            depth: 2
        });

        const output = success
            ? `\`\`\`${codeBlockParsed.lang ?? 'js'}\n' + result + '\n\`\`\``
            : '**ERROR**:\n```bash\n' + result + '\n```';

        if (output.length > 2000) {
            return msg.reply({
                content: 'Output was too long.. sent the result as a file',
                files: [{ attachment: Buffer.from(result), name: 'output.js' }]
            });
        }

        return msg.reply({ content: output });
    }
};

const Eval = async (
    msg: Message,
    code: string,
    flags: { async: boolean; depth: number }
) => {
    if (flags.async) code = `(async () => {\n${code}\n})();`;
    let success = true;
    let result = null;

    // @ts-ignore
    const client = msg.client;

    try {
        result = eval(code);
    } catch (error) {
        if (error) {
            msg.client.console.error(error);
        }
        result = error;
        success = false;
    }

    if (isThenable(result)) result = await result;

    if (typeof result !== 'string') {
        result = inspect(result, {
            depth: flags.depth
        });
    }
    result = clean(result);

    return { result, success };
};
