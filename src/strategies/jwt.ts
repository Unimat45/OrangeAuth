import { isNil, isString } from "lodash-es";
import { verify, sign } from "../functions/jwt";
import type { SignOptions } from "jsonwebtoken";
import type { Session } from "../@types/globals";
import { IStrategy, type Callbacks } from "./IStrategy";
import type { ConfigOptions } from "../@types/internals";

/**
 * Retrieves either the secret or a private key, depending on the used JWT algorithm
 * @param secret Secret key, or key pair
 * @returns The secret or private key
 */
const secretOrPrivateKey = (secret: ConfigOptions["secret"]) => (isString(secret) ? secret : secret.privateKey);

/**
 * Retrieves either the secret or a public key, depending on the used JWT algorithm
 * @param secret Secret key, or key pair
 * @returns The secret or public key
 */
const secretOrPublicKey = (secret: ConfigOptions["secret"]) => (isString(secret) ? secret : secret.publicKey);

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
        return Promise.resolve(sign(session, secretOrPrivateKey(globalCfg.secret), this.signOptions));
    }

    public override deserialize(token: string, globalCfg: ConfigOptions): Promise<Session | null> {
        // The verify function does everything for us, in this case.
        return verify<Session>(token, secretOrPublicKey(globalCfg.secret)).then(async (session) => {
            if (isNil(session)) return null;
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
