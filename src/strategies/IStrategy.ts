import { type Session } from "../@types/globals";
import type { ConfigOptions } from "../@types/internals";

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
