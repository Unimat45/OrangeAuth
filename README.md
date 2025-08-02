# 🍊 Orange Auth

### THIS IS A VERY EARLY WIP, AND SHOULD NOT BE USED

A lightweight authentication handler built for [@universal-middleware/core](https://www.npmjs.com/package/@universal-middleware/core), with support for plug-and-play providers and strategies. This package manages login/logout and session deserialization through HTTP handlers and secure cookies.

---

## ✨ Features

- Provider-based authentication (e.g., Credentials, OAuth)
- Strategy-based token serialization and deserialization (e.g., JWT)
- Secure, HTTP-only cookie session management
- Framework-agnostic and middleware-compatible
- Written in TypeScript

---

## 📦 Installation

```bash
npm install universal-auth
```

📁 Project Structure

```bash
src/
├── @types/          # Custom type definitions (e.g., Session)
├── functions/       # Utility functions
├── providers/       # Implementations of IProvider
├── strategies/      # Implementations of IStrategy
├── lib.ts           # Main exports
```

## 🚀 Usage

### 1. Define your auth configuration:

```ts
import { CreateAuth } from "universal-auth";
import { JwtStrategy } from "./strategies/jwt";
import { CredentialsProvider } from "./providers/Credentials";

const handler = CreateAuth({
  providers: [CredentialsProvider],
  secret: "your-secret-key",
  cookieName: "my-auth-cookie", // optional (default: "orange.auth")
  strategy: JwtStrategy,
  basePath: "/api/auth",
});
```

This will expose two routes:

`GET /api/auth/login/:provider`

`GET /api/auth/logout/:provider`

You must implement a matching `provider.ID`, e.g. `"credentials"`.

### 2. Use in a universal middleware router:`

```ts
import { router } from "@universal-middleware/core";
import { handler as authHandler } from "./path-to-your-auth";

export const app = router();
app.use(authHandler);
```

### 3. Getting the current session:

```ts
import { getSession } from "universal-auth";

const session = await getSession(req);
if (session) {
  console.log("Logged in as", session.user);
}
```

## 🧩 Interfaces

`IProvider`

Defines how to log in a user and return a token:

```ts
interface IProvider {
  ID: string;
  logIn(req: Request, config: ConfigOptions): Promise<string>;
}
```

`IStrategy`

Defines how to serialize and deserialize tokens:

```ts
interface IStrategy {
  deserialize(token: string, config: ConfigOptions): Promise<Session | null>;
  logOut(req: Request, config: ConfigOptions): Promise<void>;
}
```

## 🔐 Security
Cookies are set with:

`HttpOnly: true`

`SameSite: "Lax"`

`Secure: true`

`Max-Age: 600` (10 minutes)

You may customize these by modifying the `CreateAuth` implementation.
