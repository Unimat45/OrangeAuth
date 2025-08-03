# 🍊 Orange Auth

### THIS IS A VERY EARLY WIP, AND SHOULD NOT BE USED IN PRODUCTION

Authentication middleware for [@universal-middleware/core](https://www.npmjs.com/package/@universal-middleware/core), supporting provider-based login/logout and strategy-driven session handling via secure cookies.

## 🚀 Features

- Provider-based login/logout flow
- Pluggable strategies (e.g. JWT)
- Secure cookie-based session storage
- Simple, composable handler with session retrieval
- Optional cookie settings
- Framework-agnostic

## 📦 Install

```bash
npm install orange-auth
```

## 🧠 Usage

### Setup

```ts
import { CreateAuth } from "orange-auth";
import { JWT } from "orange-auth/strategies";
import { Credentials } from "orange-auth/providers";

const { handler, getSession } = CreateAuth({
  providers: [new Credentials({ ... })],
  strategy: new JWT({ ... }),
  secret: "your-secret",
  basePath: "/api/auth/:action/:provider",
});
```

You can now use:
- `POST /api/auth/login/:provider`
- `POST /api/auth/logout/:provider`

### Example (express middleware router)

```ts
import express from "express";
import { handler } from "./auth";
import { createHandler } from "@universal-middleware/express";

const app = express();
app.get("/api/auth/{*auth}", createHandler(handler)());
```

## 🧾 Session Access

```ts
import { getSession } from "./auth";

const session = await getSession(req);

if (session) {
  console.log("Logged in user:", session.user);
}
```

## 🧩 Config Options

```ts
type ConfigOptionsProps = {
    /**
     * All the available providers.
     * If multiple instance of a single provider are used with the same name, the order does matter.
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
};
```

## 🧱 Interfaces

### IProvider

```ts
abstract class IProvider {
    /**
     * Custom name for a provider
     */
    ID: string;

    /**
     * Login function. This is used to call all the login flows of each provider.
     * For now, the request's body **MUST** be JSON.
     * @param req The request object.
     * @param globalCfg The global auth config.
     */
    logIn(req: Request, globalCfg: ConfigOptions): Promise<string | null>;
}
```

### IStrategy

```ts
abstract class IStrategy {
    /**
     * Handles how a session token is generated.
     * @param session The validated session object.
     * @param globalCfg The global auth config.
     * @returns A newly generated token that will be sent as a cookie.
     */
    serialize(session: Session, globalCfg: ConfigOptions): Promise<string>;

    /**
     * Handles how a token is validated and deserialized into a session object.
     * @param token A user's token.
     * @param globalCfg The global auth config.
     * @returns A user's session if validated and found, else `null`.
     */
    deserialize(token: string, globalCfg: ConfigOptions): Promise<Session | null>;

    /**
     * Handles how a session is destroyed when a user is logging out.
     * @param req The request object.
     * @param globalCfg The global auth config.
     */
    logOut(req: Request, globalCfg: ConfigOptions): Promise<void>;
}
```

---

## 🔐 Cookie Defaults

By default, the cookie is:

- `httpOnly: true`
- `secure: true`
- `sameSite: "lax"`
- `path: "/"`
- `maxAge: 3600` (1 hour)

This can be customized via `cookieSettings` in the initial config.
