import { type Get, params, type UniversalHandler } from "@universal-middleware/core";
import { serialize as serializeCookie } from "cookie";
import Cookies from "universal-cookie";

import type { ConfigOptionsProps, Session } from "./@types/globals";
import type { ConfigOptions, Maybe } from "./@types/internals";
import type { Actions } from "./providers/IProvider";

/**
 * Deserialize a user's session based of the headers
 * @param globalCfg The global auth config
 * @param req An object having a headers field
 * @returns A user's token and session, if found and valid
 */
const getSession = async <T extends Session = Session>(
    globalCfg: ConfigOptions,
    req: { headers: Maybe<Headers | Record<string, string>> },
) => {
    if (req.headers == null)
        return {
            session: null,
            token: null,
        };

    // Find the correct cookie header
    const cookieHeader = req.headers instanceof Headers ? req.headers.get("cookie") : req.headers["cookie"];

    const cookie = new Cookies(cookieHeader);
    if (cookie == null)
        return {
            session: null,
            token: null,
        };

    // Tries to extract the specific cookie.
    const token = cookie.get(globalCfg.cookieName);
    if (token == null)
        return {
            session: null,
            token: null,
        };

    // Tries to deserialize it
    return {
        session: (await globalCfg.strategy.deserialize(token, globalCfg)) as T | null,
        token: token as string,
    };
};

/**
 * Initializes the auth. This should be called once per backend.
 * @param req Something that has a `headers` field; either a Headers instance, or just a plain object.
 * @returns A session if found and valid, or `null`.
 */
export const CreateAuth = ((config) => {
    const { secret, strategy, cookieName, providers, cookieSettings, basePath, callbacks } = config;

    if (secret == null) {
        throw new Error('[ERROR]: Auth secret missing! Make sure to set the "secret" variable in the auth\'s config.');
    }

    if (strategy == null) {
        throw new Error('[ERROR]: No strategy chosen! Make sure to set the "strategy" variable in the auth\'s config.');
    }

    // We set the global config on startup, and not on the route handler,
    // otherwise a session cannot be accessed until someone logs in
    const globalCfg = {
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
        callbacks,
    } satisfies ConfigOptions;

    return {
        /**
         * Universal handler route. You can use this with the `createHandler()` method
         * @returns
         */
        handler: () => async (req, _, runtime) => {
            if (req.method.toUpperCase() !== "POST") {
                // Do not accept other methods
                return new Response("Method Not Allowed", { status: 405 });
            }

            // Tries to get the action and provider info from the url
            const routeParams = params(req, runtime, basePath);

            if (routeParams?.["action"] == null || routeParams["provider"] == null) {
                throw new Error(
                    '[ERROR]: Base path is missing! Make sure to set the "basePath" variable in the auth\'s config.',
                );
            }

            // Finds the requested provider by name
            const path = routeParams["provider"];
            const provider = providers.find((p) => p.ID === path);

            if (provider == null) {
                return new Response("Page not found", { status: 404 });
            }

            // Handles each action independently
            switch (routeParams["action"] as Actions) {
                case "login": {
                    // Use the found provider to login
                    const token = await provider.logIn(req, globalCfg).catch(() => null);

                    // If failed, return Bad Request response
                    if (token == null) return new Response(null, { status: 400 });

                    const params = await getSession(globalCfg, {
                        // The cookie header is faked here, since the request does not have any token yet.
                        headers: { cookie: serializeCookie(globalCfg.cookieName, token) },
                    });

                    // If there is no session at this point, something as gone wrong
                    if (params.session == null || params.token == null) {
                        console.error("[AUTH ERROR]: Missing session after login");
                        return new Response("internal server error", { status: 500 });
                    }

                    // Run the login callback
                    const customRes = await globalCfg.callbacks?.login?.({
                        headers: req.headers,
                        token: params.token,
                        session: params.session,
                    });

                    // If the result is false, fail the login
                    if (customRes === false) {
                        return new Response("Bad Request", { status: 400 });
                    }

                    // If the result is a string, assume it is a redirection path
                    if (typeof customRes === "string") {
                        const headers = new Headers();
                        headers.set("Location", customRes);

                        return new Response(null, { status: 308, headers });
                    }

                    // Creates the set-cookie header
                    const headers = new Headers();
                    headers.set("Set-Cookie", serializeCookie(globalCfg.cookieName, token, globalCfg.cookieSettings));

                    // And return it
                    return new Response(null, { status: 200, headers });
                }
                case "logout": {
                    const params = await getSession(globalCfg, req);

                    // If there is no session, no need to call the callback
                    if (params.session != null && params.token != null) {
                        await globalCfg.callbacks?.logout?.({
                            headers: req.headers,
                            token: params.token,
                            session: params.session,
                        });
                    }

                    // Use the strategy to logout
                    await globalCfg.strategy.logOut(req, globalCfg);

                    // Clears the header.
                    const headers = new Headers();
                    headers.set(
                        "Set-Cookie",
                        serializeCookie(
                            globalCfg.cookieName,
                            "deleted",
                            // Use the same cookie config, but make sure it is expired
                            {
                                ...globalCfg.cookieSettings,
                                expires: new Date(0),
                                maxAge: undefined,
                            },
                        ),
                    );

                    // And send them
                    return new Response(null, { status: 200, headers });
                }
                default:
                    // If a wrong action is requested, return a 404
                    return new Response("Page not found", { status: 404 });
            }
        },
        /**
         * Deserialize a user's session.
         * @param globalCfg The global auth config
         * @param req An object having a headers field
         * @returns A user's token and session, if found and valid
         */
        getSession: <T extends Session = Session>(req: { headers: Maybe<Headers | Record<string, string>> }) =>
            // Only returns the session
            getSession<T>(globalCfg, req).then((doc) => doc.session) as Promise<T | null>,
    };
}) satisfies Get<
    [config: ConfigOptionsProps],
    {
        handler: Get<[], UniversalHandler>;
        getSession: <T extends Session = Session>(req: {
            headers: Maybe<Headers | Record<string, string>>;
        }) => Promise<T | null>;
    }
>;
