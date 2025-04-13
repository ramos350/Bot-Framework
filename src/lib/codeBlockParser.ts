const codeBlockRegex = /```(?:(?<lang>\S+)\n)?\s?(?<code>[^]+?)\s?```/;

export default function parseCodeBlock(code: string): {
    code?: string;
    lang?: string;
} {
    const match = code.match(codeBlockRegex);
    if (!match) {
        return { code, lang: '' };
    }

    const { groups } = match;
    const parsedLang = groups?.lang || undefined;
    const parsedCode = groups?.code || undefined;

    return { code: parsedCode, lang: parsedLang };
}
