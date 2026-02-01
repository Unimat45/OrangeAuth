import { getCookie } from "@universal-middleware/core/cookie";

import type { ConfigOptions, Maybe } from "../@types/internals";

/**
 * Deserialize a user's session based of the headers
 * @param globalCfg The global auth config
 * @param req An object having a headers field
 * @returns A user's token and session, if found and valid
 */
async function getSession(globalCfg: ConfigOptions, req: { headers: Maybe<Headers | Record<string, string>> }) {
    if (req.headers == null)
        return {
            session: null,
            token: null,
        };

    const r = new Request("/null", { headers: req.headers });

    // Tries to extract the specific cookie.
    const cookie = getCookie(r, globalCfg.cookieName);

    if (cookie == null)
        return {
            session: null,
            token: null,
        };

    const token = cookie.value;
    // Tries to deserialize it
    return {
        session: await globalCfg.strategy.deserialize(token, globalCfg),
        token,
    };
}

export { getSession };
