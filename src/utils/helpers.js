export const generateSymbol = (exchange, base, quote) => {
    const short = `${base}/${quote}`;
    return {
        short,
        full: `${exchange}:${short}`,
    };
}

export const parseFullSymbol = (fullSymbol) => {
    const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
    if (!match) {
        return null;
    }

    return { exchange: match[1], fromSymbol: match[2], toSymbol: match[3] };
}