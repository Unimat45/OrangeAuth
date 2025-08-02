import type { ConfigOptions } from "../lib";
import type { Session } from "../@types/globals";

export type Actions = "login" | "logout";

abstract class IProvider {
    private __ID: string;

    constructor(ID: string) {
        this.__ID = ID;
    }

    public get ID(): string {
        return this.__ID;
    }

    public abstract getSession(req: Request, globalCfg: ConfigOptions): Promise<Session | null>;
    public abstract logIn(req: Request, globalCfg: ConfigOptions): Promise<string | null>;
}

export { IProvider };
