declare global {
    type MaybePromise<T> = T | Promise<T>;
}

export interface Session extends Record<string, unknown> {
    id: string;
}
