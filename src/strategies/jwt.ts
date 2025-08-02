import { IStrategy } from "./IStrategy";
import type { ConfigOptions } from "../lib";
import { verify, sign } from "../functions/jwt";
import type { SignOptions } from "jsonwebtoken";
import type { Session } from "../@types/globals";

class JWT extends IStrategy {
    private signOptions: SignOptions;

    constructor(options: SignOptions = { expiresIn: "1h" }) {
        super();

        this.signOptions = options;
    }

    public override serialize(session: Session, globalCfg: ConfigOptions): Promise<string> {
        return Promise.resolve(sign(session, globalCfg.secret, this.signOptions));
    }

    public override deserialize(token: string, globalCfg: ConfigOptions): Promise<Session | null> {
        return verify(token, globalCfg.secret);
    }

    public override logOut(): Promise<void> {
        return Promise.resolve();
    }
}

export { JWT };
