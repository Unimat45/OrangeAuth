import { type MaybePromise, type Session } from "../@types/globals";
import type { ConfigOptions } from "../@types/internals";

/**
 * Strategies callbacks
 */
export type Callbacks = Partial<{
    /**
     * Pre-serialization callback. This can be used to add some steps to this process.
     * @param session The session to be serialized.
     * @returns A boolean representing if the serialization should occur.
     */
    serialize: (session: Session) => MaybePromise<boolean>;
    /**
     * Post-deserialization callback. This can be used to add some validation to this process.
     * @param session The token that was deserialized.
     * @returns A boolean representing if the deserialization is valid.
     */
    deserialize: (token: string, session: Session) => MaybePromise<boolean>;
}>;

/**
 * A strategy is used to handle the creation, validation and accessing a user's session.
 */
abstract class IStrategy {
    protected callbacks: Callbacks;

    constructor(callbacks: Callbacks) {
        this.callbacks = callbacks;
    }

    /**
     * Handles how a session token is generated.
     * @param session The validated session object.
     * @param globalCfg The global auth config.
     * @returns A newly generated token that will be sent as a cookie.
     */
    public abstract serialize(session: Session, globalCfg: ConfigOptions): Promise<string>;

    /**
     * Handles how a token is validated and deserialized into a session object.
     * @param token A user's token.
     * @param globalCfg The global auth config.
     * @returns A user's session if validated and found, else `null`.
     */
    public abstract deserialize(token: string, globalCfg: ConfigOptions): Promise<Session | null>;

    /**
     * Handles how a session is destroyed when a user is logging out.
     * @param req The request object.
     * @param globalCfg The global auth config.
     */
    public abstract logOut(req: Request, globalCfg: ConfigOptions): Promise<void>;
}

export { IStrategy };
