import Cookies from "universal-cookie";
import { find, isNil } from "lodash-es";
import { serialize as cookie } from "cookie";
import type { Session } from "./@types/globals";
import type { IStrategy } from "./strategies/IStrategy";
import type { Actions, IProvider } from "./providers/IProvider";
import { type UniversalHandler, type Get, params } from "@universal-middleware/core";

type Maybe<T> = T | null | undefined;

export type ConfigOptionsProps = Readonly<{
    providers: IProvider[];
    secret: string;
    cookieName?: string;
    strategy: IStrategy;
    basePath: string;
}>;

export type ConfigOptions = Required<Omit<ConfigOptionsProps, "basePath">>;

let globalCfg: ConfigOptions;

export const CreateAuth = ((config: ConfigOptionsProps) => async (req, _, runtime) => {
    const { secret, strategy, cookieName, providers, basePath } = config;

    const routeParams = params(req, runtime, basePath);

    if (isNil(routeParams?.["action"]) || isNil(routeParams["provider"])) {
        throw new Error(
            '[ERROR]: Base path is missing! Make sure to set the "basePath" variable in the auth\'s config.',
        );
    }

    if (isNil(secret)) {
        throw new Error('[ERROR]: Auth secret missing! Make sure to set the "secret" variable in the auth\'s config.');
    }

    if (isNil(strategy)) {
        throw new Error('[ERROR]: No strategy chosen! Make sure to set the "strategy" variable in the auth\'s config.');
    }

    globalCfg = {
        cookieName: cookieName ?? "orange.auth",
        providers: providers ?? [],
        secret,
        strategy,
    };

    const path = routeParams["provider"];
    const provider = find(providers, (p) => p.ID === path);

    if (isNil(provider)) {
        return new Response("Page not found", { status: 404 });
    }

    switch (routeParams["action"] as Actions) {
        case "login": {
            const token = await provider.logIn(req, globalCfg).catch(() => null);

            if (isNil(token)) return new Response(null, { status: 400 });

            const headers = new Headers();
            headers.set(
                "Set-Cookie",
                cookie(globalCfg.cookieName, token, {
                    path: "/",
                    httpOnly: true,
                    sameSite: "lax",
                    secure: true,
                    maxAge: 600,
                }),
            );

            return new Response(null, { status: 200, headers });
        }
        case "logout": {
            await globalCfg.strategy.logOut(req, globalCfg);

            const headers = new Headers();
            headers.set("Set-Cookie", cookie(globalCfg.cookieName, ""));

            return new Response(null, { status: 200, headers });
        }
        default:
            return new Response("Page not found", { status: 404 });
    }
}) satisfies Get<[config: ConfigOptionsProps], UniversalHandler>;

export const getSession = <T extends Session = Session>(req: { headers: Maybe<Headers | Record<string, string>> }) => {
    if (isNil(req.headers)) return null;

    const cookieHeader = req.headers instanceof Headers ? req.headers.get("cookie") : req.headers["cookie"];

    const cookie = new Cookies(cookieHeader);
    if (isNil(cookie)) return null;

    const token = cookie.get(globalCfg.cookieName);
    if (isNil(token)) return null;

    return globalCfg.strategy.deserialize(token, globalCfg) as Promise<T | null>;
};
