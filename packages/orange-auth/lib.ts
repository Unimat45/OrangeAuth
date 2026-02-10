import { type Get, params, type UniversalHandler } from "@universal-middleware/core";
import { join } from "node:path/posix";

import type { ClientConfigOptions } from "../client/@types/globals";
import type { ConfigOptionsProps, Session } from "./@types/globals";
import type { ConfigOptions, Maybe } from "./@types/internals";
import * as actions from "./actions/index";
import { getSession } from "./functions/index";
import type { Actions } from "./providers/IProvider";

/**
 * Initializes the auth. This should be called once per backend.
 * @param req Something that has a `headers` field; either a Headers instance, or just a plain object.
 * @returns A session if found and valid, or `null`.
 */
export const CreateAuth = ((config) => {
    const { secret, strategy, cookieName, providers, cookieSettings, basePath: basePathAsProp, callbacks } = config;

    // Adds the dynamic actions to the base url
    const basePath = join(basePathAsProp, ":action", ":provider");

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
        cookieSettings: {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            maxAge: 3600,
            ...cookieSettings,
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

            const actionParam = routeParams["action"] as Actions;

            const action = actions[actionParam];

            if (action == null) {
                // If a wrong action is requested, return a 404
                return new Response("Page not found", { status: 404 });
            }

            // Handles each action independently
            return Promise.resolve(action({ globalCfg, provider, req }));
        },
        clientConfig: {
            basePath: config.basePath,
            providers: globalCfg.providers.map((p) => p.ID),
            cookieName: globalCfg.cookieName,
        },
        /**
         * Deserialize a user's session.
         * @param globalCfg The global auth config
         * @param req An object having a headers field
         * @returns A user's token and session, if found and valid
         */
        getSession: (req: { headers: Maybe<Headers | Record<string, string>> }) =>
            // Only returns the session
            getSession(globalCfg, req).then((doc) => doc.session),
    };
}) satisfies Get<
    [config: ConfigOptionsProps],
    {
        clientConfig: ClientConfigOptions;
        handler: Get<[], UniversalHandler>;
        getSession: (req: { headers: Maybe<Headers | Record<string, string>> }) => Promise<Session | null>;
    }
>;
