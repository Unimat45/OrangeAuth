import { isNil } from "lodash-es";
import { IProvider } from "./IProvider";
import type { ConfigOptions } from "../@types/internals";
import type { Session, MaybePromise } from "../@types/globals";

/**
 * Configuration options of the Credentials provider
 */
export type CredentialsConfig<TCredentials extends string> = Readonly<{
    /**
     * The name of this provider, should not be changed unless you are
     * using multiple instance of the same provider.
     */
    name?: "credentials" | (string & {});
    /**
     * The available fields coming from the request containing credentials.
     */
    credentials: TCredentials[];
    /**
     * Function that gets called when a user tries to login.
     * This is where you should look inside your database for the user.
     * @param credentials An object containing the credentials from the request's body.
     * @returns A session object if a user is found, or `null`.
     */
    authorize: (credentials: Record<TCredentials, string>) => MaybePromise<Session | null>;
}>;

/**
 * Provider used to login a user using basic credentials.
 */
export class Credentials<TCredentials extends string = string> extends IProvider {
    private config: CredentialsConfig<TCredentials>;

    constructor(config: CredentialsConfig<TCredentials>) {
        super(config.name ?? "credentials");
        this.config = config;
    }

    public override async logIn(req: Request, globalCfg: ConfigOptions): Promise<string | null> {
        // We assume the  body is json here, might change that later to be more flexible
        const body = (await req.json()) as Record<TCredentials, string>;

        // Calls the user defined authorize callback
        const session = await this.config.authorize(body);
        if (isNil(session)) return null;

        // Create a token
        return globalCfg.strategy.serialize(session, globalCfg);
    }
}
