import { isNil } from "lodash-es";
import Cookies from "universal-cookie";
import { IProvider } from "./IProvider";
import type { ConfigOptions } from "../lib";
import type { Session } from "../@types/globals";

export type CredentialsConfig<TCredentials extends string> = Readonly<{
    name?: "credentials" | (string & {});
    credentials: TCredentials[];
    authorize: (credentials: Record<TCredentials, string>) => MaybePromise<Session | null>;
}>;

export class Credentials<TCredentials extends string = string> extends IProvider {
    private config: CredentialsConfig<TCredentials>;

    constructor(config: CredentialsConfig<TCredentials>) {
        super("credentials");
        this.config = config;
    }

    public override async getSession(req: Request, globalCfg: ConfigOptions): Promise<Session | null> {
        const cookies = new Cookies(req.headers.get("cookie"));

        const token = cookies.get(globalCfg.cookieName);
        if (token == null) return null;

        return globalCfg.strategy.deserialize(token, globalCfg);
    }

    public override async logIn(req: Request, globalCfg: ConfigOptions): Promise<string | null> {
        const body = (await req.json()) as Record<TCredentials, string>;

        const session = await this.config.authorize(body);
        if (isNil(session)) return null;

        return globalCfg.strategy.serialize(session, globalCfg);
    }
}
