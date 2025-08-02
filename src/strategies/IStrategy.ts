import type { __internal__Options } from "../lib";
import { type Session } from "../@types/globals";

/**
 * A strategy is used to handle the creation, validation and accessing a user's session.
 */
abstract class IStrategy {
    /**
     * Handles how a session token is generated.
     * @param session The validated session object.
     * @param globalCfg The global auth config.
     * @returns A newly generated token that will be sent as a cookie.
     */
    public abstract serialize(session: Session, globalCfg: __internal__Options): Promise<string>;

    /**
     * Handles how a token is validated and deserialized into a session object.
     * @param token A user's token.
     * @param globalCfg The global auth config.
     * @returns A user's session if validated and found, else `null`.
     */
    public abstract deserialize(token: string, globalCfg: __internal__Options): Promise<Session | null>;

    /**
     * Handles how a session is destroyed when a user is logging out.
     * @param req The request object.
     * @param globalCfg The global auth config.
     */
    public abstract logOut(req: Request, globalCfg: __internal__Options): Promise<void>;
}

export { IStrategy };
