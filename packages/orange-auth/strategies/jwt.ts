import type { SignOptions } from "jsonwebtoken";

import type { Session } from "../@types/globals";
import type { ConfigOptions } from "../@types/internals";
import { sign, verify } from "../functions/jwt";
import { type Callbacks, IStrategy } from "./IStrategy";

/**
 * Basic JWT strategy
 */
class JWT extends IStrategy {
    /**
     * Forwarded standard JWT options
     */
    private signOptions: SignOptions;

    constructor(options: SignOptions = { expiresIn: "1h" }, callbacks: Callbacks = {}) {
        super(callbacks);

        this.signOptions = options;
    }

    public override async serialize(session: Session, globalCfg: ConfigOptions): Promise<string> {
        // If there is no callback set, we can just run normally, so fallback to true.
        const shouldRun = await Promise.resolve(this.callbacks.serialize?.(session) ?? true);

        if (!shouldRun) {
            return Promise.reject("Serialize callback rejection");
        }

        // Directly call the sign function, but make it async.
        return Promise.resolve(sign(session, globalCfg.secret, this.signOptions));
    }

    public override deserialize(token: string, globalCfg: ConfigOptions): Promise<Session | null> {
        // The verify function does everything for us, in this case.
        return verify<Session>(token, globalCfg.secret).then(async (session) => {
            if (session == null) return null;
            const isValid = await Promise.resolve(this.callbacks.deserialize?.(token, session) ?? true);
            return isValid ? session : null;
        });
    }

    public override logOut(): Promise<void> {
        // Since a JWT does not have any data in a DB, there is nothing to do here.
        return Promise.resolve();
    }
}

export { JWT };
