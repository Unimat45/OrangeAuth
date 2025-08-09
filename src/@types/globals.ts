import { type SerializeOptions } from "cookie";
import type { IProvider } from "../providers/IProvider";
import type { IStrategy } from "../strategies/IStrategy";

/**
 * This is a Promise, or not...
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * General session type. This should be augmented to include your session's fields.
 */
export interface Session extends Record<string, unknown> {
    id: string;
}

/**
 * Parameters for the custom callbacks
 */
type CallbackParams = {
    /**
     * The current token
     */
    token: string;
    /**
     * The current deserialized token
     */
    session: Session;
    /**
     * TThe request's headers
     */
    headers: Headers;
};

/**
 * Auth Configuration props.
 */
export type ConfigOptionsProps = Readonly<{
    /**
     * All the available providers.
     * If multiple instance of a single provider are used, the order does matter.
     */
    providers: IProvider[];

    /**
     * Your secret key.
     */
    secret: string | { publicKey: string; privateKey: string };

    /**
     * A custom name for the cookie.
     * Otherwise, the default name will be `orange.auth`
     */
    cookieName?: string;

    /**
     * The strategy to be used.
     */
    strategy: IStrategy;

    /**
     * This should be the url path that your auth is set up on, including the action and provider variables.
     * @example
     * ```js
     * const app = express();
     *
     * const { handler } = CreateAuth({
     *   basePath: "/api/auth/:action/:provider",
     *   ...
     * });
     *
     * app.all("/api/auth/{*auth}", createHandler(handler)());
     * ```
     */
    basePath: string;

    /**
     * Cookie serialization options. see [MDN Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)
     */
    cookieSettings?: SerializeOptions;

    /**
     * Custom callbacks
     */
    callbacks?: {
        /**
         * Custom login callback. This is ran after logging in with the provider.
         * This can accept 2 return types: a boolean that indicates if the login is valid,
         * or a url which will redirect the user.
         * @param params An object containing the token, session and headers of a request.
         * @returns a boolean that indicates if the login is valid,
         * or a url which will redirect the user.
         */
        login?: (params: CallbackParams) => MaybePromise<boolean | string>;

        /**
         * Custom logout callback. This is ran before logging out with the strategy.
         * @param params An object containing the token, session and headers of a request.
         * @returns Nothing, or an empty promise.
         */
        logout?: (params: CallbackParams) => MaybePromise<void>;
    };
}>;
