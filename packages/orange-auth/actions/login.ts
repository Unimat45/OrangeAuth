import { setCookie } from "@universal-middleware/core/cookie";

import type { IAction } from "./IAction";

const login: IAction = async ({ req, globalCfg, provider }) => {
    // Use the found provider to login
    const params = await provider.logIn(req, globalCfg).catch(() => null);

    // If failed, return Bad Request response
    if (params == null) return new Response(null, { status: 400 });

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

    const res = new Response(null, { status: 200 });

    // Creates the set-cookie header
    setCookie(res, globalCfg.cookieName, params.token, globalCfg.cookieSettings);

    // And send it
    return res;
};

export { login };
