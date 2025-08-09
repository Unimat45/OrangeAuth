import type { ConfigOptions } from "../@types/internals";

/**
 * Available url callback actions.
 */
export type Actions = "login" | "logout";

/**
 * Providers are used to implement certain services (E.g. facebook, github, credentials) as login methods.
 * Every provider should inherit from this.
 */
abstract class IProvider {
    /**
     * This is used to map a callback to a provider.
     */
    private readonly __ID: string;

    constructor(ID: string) {
        this.__ID = ID;
    }

    /**
     * The provider ID.
     */
    public get ID(): string {
        return this.__ID;
    }

    /**
     * Login function. This is used to call all the login flows of each provider.
     * For now, the request's body **MUST** be JSON.
     * @param req The request object.
     * @param globalCfg The global auth config.
     */
    public abstract logIn(req: Request, globalCfg: ConfigOptions): Promise<string | null>;
}

export { IProvider };
