import { describe, expect, test } from "bun:test";

import { ConfigOptions } from "../../src/@types/internals";
import { verify } from "../../src/functions";
import { Credentials } from "../../src/providers";
import { JWT } from "../../src/strategies";

describe("Tests if the credentials provider works", () => {
    test("Login returns a valid session token", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(),
            callbacks: {
                login: () => true,
            },
            providers: [
                new Credentials({
                    authorize: () => ({ id: "some user" }),
                    credentials: [],
                }),
            ],
        };

        const provider = globalCfg.providers[0];

        const req = new Request("http://localhost:3000", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "bob.b@somedomain.com", password: "abcd1234!" }),
        });

        const payload = await provider.logIn(req, globalCfg);

        expect(payload).not.toBeNull();

        const { session, token } = payload!;

        expect(verify.bind(undefined, token, globalCfg.secret.toString())).not.toBeNull();

        expect(session).toMatchObject({
            id: "some user",
        });
    });
    test("Login fails based off the authorize callback", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(),
            callbacks: {
                login: () => true,
            },
            providers: [
                new Credentials({
                    authorize: () => null,
                    credentials: [],
                }),
            ],
        };

        const provider = globalCfg.providers[0];

        const req = new Request("http://localhost:3000", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "bob.b@somedomain.com", password: "abcd1234!" }),
        });

        const token = await provider.logIn(req, globalCfg);

        expect(token).toBeNull();
    });
    test("Login parses urlencoded body", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(),
            callbacks: {
                login: () => false,
            },
            providers: [
                new Credentials({
                    authorize: () => ({ id: "some user" }),
                    credentials: [],
                }),
            ],
        };

        const provider = globalCfg.providers[0];

        const req = new Request("http://localhost:3000", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-urlencoded" },
            body: encodeURIComponent("email=bob.b@somedomain.com&password=abcd1234!"),
        });

        const payload = await provider.logIn(req, globalCfg);

        expect(payload).not.toBeNull();

        const { session, token } = payload!;

        expect(verify.bind(undefined, token, globalCfg.secret.toString())).not.toBeNull();

        expect(session).toMatchObject({
            id: "some user",
        });
    });
    test("Login parses multipart body", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(),
            callbacks: {
                login: () => false,
            },
            providers: [
                new Credentials({
                    authorize: () => ({ id: "some user" }),
                    credentials: [],
                }),
            ],
        };

        const provider = globalCfg.providers[0];

        const boundary = "----fakeboundary12345";
        const body =
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="email"\r\n\r\n` +
            `bob.b@somedomain.com\r\n` +
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="password"\r\n\r\n` +
            `abcd1234!\r\n` +
            `--${boundary}--\r\n`;

        const req = new Request("http://localhost:3000", {
            method: "POST",
            headers: {
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
            },
            body,
        });

        const payload = await provider.logIn(req, globalCfg);

        expect(payload).not.toBeNull();

        const { session, token } = payload!;

        expect(verify.bind(undefined, token, globalCfg.secret.toString())).not.toBeNull();

        expect(session).toMatchObject({
            id: "some user",
        });
    });
    test("Login fails for unsupported content type", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(),
            callbacks: {
                login: () => false,
            },
            providers: [
                new Credentials({
                    authorize: () => ({ id: "some user" }),
                    credentials: [],
                }),
            ],
        };

        const provider = globalCfg.providers[0];

        const req = new Request("http://localhost:3000", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            body: "Email: bob.b@somedomain.com\nPassword: abcd1234!\n",
        });

        const token = await provider.logIn(req, globalCfg);

        expect(token).toBeNull();
    });
});
