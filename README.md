# 🍊 Orange Auth

[![npm version](https://img.shields.io/npm/v/orange-auth?color=orange&logo=npm)](https://www.npmjs.com/package/orange-auth)
[![License](https://img.shields.io/github/license/Unimat45/OrangeAuth?color=blue)](./COPYING)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Unimat45/OrangeAuth/.github/workflows/publish.yaml?branch=dev&logo=github)


> **⚠️ Early WIP:** This project is experimental and not ready for production use.  
> Use at your own risk.

**OrangeAuth** is a framework-agnostic, modular authentication middleware for Node.js & TypeScript.  
It provides a clean workflow for session handling, provider-based login/logout, cookie storage, and customizable strategies.

---

## 🔍 Features

- 🧩 **Provider-based Auth:** Plug in local credentials, OAuth providers, etc.
- 🔑 **Strategies:** Swap how sessions are created, verified, and serialized (e.g., JWT).
- 🍪 **Secure Cookies:** Built-in cookie handling with sensible defaults.
- 🛠️ **Framework-agnostic:** Works with many routing layers via adapters (e.g., Express).
- 📦 **Modular API:** Add or customize providers and strategies easily.

## 🚀 Installation

```bash
npm install orange-auth
```

## 🧠 Quick Usage

### Setup

```ts
import { CreateAuth } from "orange-auth";
import { JWT } from "orange-auth/strategies";
import { Credentials } from "orange-auth/providers";

const { handler, getSession } = CreateAuth({
  providers: [new Credentials({ /* options */ })],
  strategy: new JWT({ /* jwt options */ }),
  secret: "your-secret",
  basePath: "/api/auth",
});
```

### Using with Express

```ts
import express from "express";
import { handler } from "./auth";
import { createHandler } from "@universal-middleware/express";

const app = express();

// Attach auth handler on `/api/auth/*`
app.all("/api/auth/*", createHandler(handler)());
```

## 📡 Available Endpoints

Once configured, your handlers expose:

| Method | Path                         | Action                |
| ------ | ---------------------------- | --------------------- |
| POST   | `/api/auth/login/:provider`  | Login via provider    |
| POST   | `/api/auth/logout/:provider` | Log out from provider |

## 🧩 Session Access

You can retrieve session data programmatically:

```ts
const session = await getSession(req);

if (session) {
  console.log("Logged in user:", session.user);
}
```

## ⚙️ Configuration

### `CreateAuth` Options

| Option            | Type          | Description                                       |
| ----------------- | ------------- | ------------------------------------------------- |
| `providers`       | `IProvider[]` | List of auth providers (e.g., Credentials, OAuth) |
| `strategy`        | `IStrategy`   | Strategy for token/session (JWT, etc.)            |
| `secret`          | `string`      | Secret key for signing/validation                 |
| `basePath`        | `string`      | API route prefix for auth                         |
| `cookieName?`     | `string`      | Custom cookie key (defaults to `orange.auth`)     |
| `cookieSettings?` | `object`      | Cookie serialization options                      |

⚠️ Providers and strategies are designed to be modular — you can write your own by implementing the relevant interfaces.

## 📌 When to Use

OrangeAuth fits well when you want:

* A **flexible auth layer** for APIs (REST or serverless)
* A **strategy-agnostic session store** (e.g., JWT, encrypted tokens)
* A **provider pattern** instead of monolithic auth

## 📚 Roadmap

Future improvements might include:

* 👤 Additional built-in provider support (OAuth2, OpenID)
* 🧪 Built-in test helpers and mocks
* 🌐 Better TypeScript typings for providers
* 🔌 Framework adapters (Fastify, Next.js, etc.)

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/my-awesome-change
   ```
3. Make your changes, add tests, update docs.
4. Submit a pull request.

We welcome enhancements, bug fixes, and docs improvements!

## 📄 License

This project is licensed under the **GNU General Public License v3.0 or later (GPL-3.0+)**.

You are free to use, modify, and redistribute this software under the terms of the GPL, provided that any derivative work is also distributed under the same license.

See the [COPYING](./COPYING) file for full details.

© Unimat45
