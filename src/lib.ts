import Cookies from "universal-cookie";
import { assign, find, isNil } from "lodash-es";
import type { Session } from "./@types/globals";
import type { IStrategy } from "./strategies/IStrategy";
import type { Actions, IProvider } from "./providers/IProvider";
import { serialize as cookie, type SerializeOptions } from "cookie";
import { type UniversalHandler, type Get, params } from "@universal-middleware/core";

type Maybe<T> = T | null | undefined;

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
    secret: string;

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
     * app.all("/api/auth/{*auth}", createHandler(CreateAuth)({
     *      basePath: "/api/auth/:action/:provider",
     *      ...
     * }))
     * ```
     */
    basePath: string;

    /**
     * Cookie serialization options. see [MDN Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)
     */
    cookieSettings?: SerializeOptions;
}>;

/**
 * Internally used version of the options
 */
export type __internal__Options = Required<Omit<ConfigOptionsProps, "basePath">>;

// Default config, only set otherwise `assign` doesn't like it.
let globalCfg: __internal__Options = {
    cookieName: "orange.auth",
    providers: [],
    secret: crypto.randomUUID(),
    strategy: null! as IStrategy,
    cookieSettings: {},
};

export const CreateAuth = ((config: ConfigOptionsProps) => {
    const { secret, strategy, cookieName, providers, cookieSettings, basePath } = config;

    if (isNil(secret)) {
        throw new Error('[ERROR]: Auth secret missing! Make sure to set the "secret" variable in the auth\'s config.');
    }

    if (isNil(strategy)) {
        throw new Error('[ERROR]: No strategy chosen! Make sure to set the "strategy" variable in the auth\'s config.');
    }

    // We set the global config on startup, and not on the route handler,
    // otherwise a session cannot be accessed until someone logs in
    assign(globalCfg, {
        cookieName: cookieName ?? "orange.auth",
        providers: providers ?? [],
        secret,
        strategy,
        cookieSettings: cookieSettings ?? {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            maxAge: 3600,
        },
    });

    return async (req, _, runtime) => {
        // Tries to get the action and provider info from the url
        const routeParams = params(req, runtime, basePath);

        if (isNil(routeParams?.["action"]) || isNil(routeParams["provider"])) {
            throw new Error(
                '[ERROR]: Base path is missing! Make sure to set the "basePath" variable in the auth\'s config.',
            );
        }

        // Finds the requested provider by name
        const path = routeParams["provider"];
        const provider = find(providers, (p) => p.ID === path);

        if (isNil(provider)) {
            return new Response("Page not found", { status: 404 });
        }

        // Handles each action independently
        switch (routeParams["action"] as Actions) {
            case "login": {
                // Use the found provider to login
                const token = await provider.logIn(req, globalCfg).catch(() => null);

                // If failed, return Bad Request response
                if (isNil(token)) return new Response(null, { status: 400 });

                // Creates the set-cookie header
                const headers = new Headers();
                headers.set("Set-Cookie", cookie(globalCfg.cookieName, token, globalCfg.cookieSettings));

                // And returns it
                return new Response(null, { status: 200, headers });
            }
            case "logout": {
                // Use the strategy  to logout
                await globalCfg.strategy.logOut(req, globalCfg);

                // Clears the header.
                const headers = new Headers();
                headers.set("Set-Cookie", cookie(globalCfg.cookieName, ""));

                // And send them
                return new Response(null, { status: 200, headers });
            }
            default:
                // If a wrong action is requested, return a 404
                return new Response("Page not found", { status: 404 });
        }
    };
}) satisfies Get<[config: ConfigOptionsProps], UniversalHandler>;

/**
 * Access a user's session.
 * @param req Something that has a `headers` field; either a Headers instance, or just a plain object.
 * @returns A session if found and valid, or `null`.
 */
export const getSession = <T extends Session = Session>(req: { headers: Maybe<Headers | Record<string, string>> }) => {
    if (isNil(req.headers)) return null;

    // Find the correct cookie header
    const cookieHeader = req.headers instanceof Headers ? req.headers.get("cookie") : req.headers["cookie"];

    const cookie = new Cookies(cookieHeader);
    if (isNil(cookie)) return null;

    // Tries to extract the specific cookie.
    const token = cookie.get(globalCfg.cookieName);
    if (isNil(token)) return null;

    // Tries to deserialize it
    return globalCfg.strategy.deserialize(token, globalCfg) as Promise<T | null>;
};
