import type { MaybePromise, Session } from "../@types/globals";
import type { ConfigOptions } from "../@types/internals";
import { urlencodedToJson } from "../functions/index";
import { IProvider } from "./IProvider";

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

    public override async logIn(
        req: Request,
        globalCfg: ConfigOptions,
    ): Promise<{ session: Session; token: string } | null> {
        const contentType = (req.headers.get("Content-Type")?.split(";")[0] ?? "text/plain").toLowerCase();

        let body: Record<TCredentials, string>;

        switch (contentType) {
            case "application/json":
                body = (await req.json()) as Record<TCredentials, string>;
                break;
            case "application/x-www-urlencoded":
                body = await req.text().then(urlencodedToJson<Record<TCredentials, string>>);
                break;
            case "multipart/form-data":
                {
                    const data = await req.formData();
                    body = Object.fromEntries(data) as Record<TCredentials, string>;
                }
                break;
            // fields should come from a form, so every un-supported types will be failing.
            case "text/plain":
            default:
                return null;
        }

        // Calls the user defined authorize callback
        const session = await this.config.authorize(body);
        if (session == null) return null;

        // Create a token
        const token = await globalCfg.strategy.serialize(session, globalCfg).catch((err) => {
            console.log(err);
            return null;
        });

        if (token == null) return null;

        return { session, token };
    }
}
