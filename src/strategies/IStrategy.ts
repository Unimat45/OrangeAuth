import type { ConfigOptions } from "../lib";
import { type Session } from "../@types/globals";

abstract class IStrategy {
    public abstract serialize(session: Session, globalCfg: ConfigOptions): Promise<string>;
    public abstract deserialize(token: string, globalCfg: ConfigOptions): Promise<Session | null>;
    public abstract logOut(req: Request, globalCfg: ConfigOptions): Promise<void>;
}

export { IStrategy };
