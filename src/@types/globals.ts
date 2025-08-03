/**
 * This is a Promise, or not...
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * General session type. This should be augmented to include your session's fields.
 */
export interface Session extends Record<string, unknown> {
    id: string;
}
