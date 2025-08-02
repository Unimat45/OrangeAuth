import { IStrategy } from "./IStrategy";
import type { __internal__Options } from "../lib";
import { verify, sign } from "../functions/jwt";
import type { SignOptions } from "jsonwebtoken";
import type { Session } from "../@types/globals";

/**
 * Basic JWT strategy
 */
class JWT extends IStrategy {
    /**
     * Forwarded standard JWT options
     */
    private signOptions: SignOptions;

    constructor(options: SignOptions = { expiresIn: "1h" }) {
        super();

        this.signOptions = options;
    }

    public override serialize(session: Session, globalCfg: __internal__Options): Promise<string> {
        // Directly call the sign function, but make it async.
        return Promise.resolve(sign(session, globalCfg.secret, this.signOptions));
    }

    public override deserialize(token: string, globalCfg: __internal__Options): Promise<Session | null> {
        // The verify function does everything for us, in this case.
        return verify(token, globalCfg.secret);
    }

    public override logOut(): Promise<void> {
        // Since a JWT does not have any data in a DB, there is nothing to do here.
        return Promise.resolve();
    }
}

export { JWT };
