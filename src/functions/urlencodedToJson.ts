export function urlencodedToJson<T extends object = object>(value: string): T {
    return Object.fromEntries(
        value
            .trim()
            .split("&")
            .map((s) => s.split("="))
            .filter((pair) => pair.length === 2)
            .map((pair) => pair.map(decodeURIComponent)),
    );
}
