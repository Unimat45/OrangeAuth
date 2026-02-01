import { setCookie } from "@universal-middleware/core/cookie";

import { getSession } from "../functions/index";
import type { IAction } from "./IAction";

const logout: IAction = async ({ req, globalCfg }) => {
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

    const res = new Response(null, { status: 200 });
    // Clears the header.
    setCookie(res, globalCfg.cookieName, "deleted", {
        // Use the same cookie config, but make sure it is expired
        ...globalCfg.cookieSettings,
        expires: new Date(0),
        maxAge: undefined,
    });

    // And send it
    return res;
};

export { logout };
