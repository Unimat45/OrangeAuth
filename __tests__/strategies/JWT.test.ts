import { describe, expect, test } from "bun:test";

import { ConfigOptions } from "../../src/@types/internals";
import { JWT } from "../../src/strategies";

describe("Test if the JWT strategy is working", () => {
    test("Serializing", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(),
            callbacks: {
                login: () => false,
            },
            providers: [],
        };

        const token = await globalCfg.strategy.serialize({ id: "some user" }, globalCfg).catch(() => null);

        expect(token).not.toBeNull();
    });

    test("Custom serializing callback force fail", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(undefined, { serialize: () => false }),
            callbacks: {
                login: () => false,
            },
            providers: [],
        };

        const token = await globalCfg.strategy.serialize({ id: "some user" }, globalCfg).catch(() => null);

        expect(token).toBeNull();
    });

    test("deserializing valid token", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(),
            callbacks: {
                login: () => false,
            },
            providers: [],
        };

        const token = await globalCfg.strategy
            .deserialize(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNvbWUgdXNlciIsImlhdCI6MTc1NDg0MDQ2MX0.wnfErbZrdWCmL32IXtu372dUsnE71BibnnjUQr35VQk",
                globalCfg,
            )
            .catch(() => null);

        expect(token).toMatchObject({
            id: "some user",
        });
    });

    test("custom deserializing callback force fail", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(undefined, { deserialize: () => false }),
            callbacks: {
                login: () => false,
            },
            providers: [],
        };

        const token = await globalCfg.strategy
            .deserialize(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNvbWUgdXNlciIsImlhdCI6MTc1NDg0MDQ2MX0.wnfErbZrdWCmL32IXtu372dUsnE71BibnnjUQr35VQk",
                globalCfg,
            )
            .catch(() => null);

        expect(token).toBeNull();
    });

    test("deserializing invalid token", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(),
            callbacks: {
                login: () => false,
            },
            providers: [],
        };

        const token = await globalCfg.strategy
            .deserialize(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNvbWUgdXNlciIsImlhdCI6MTc1NDg0MDk2N30.SbogyMRT-oEXUcCKXiVrDx_AAqon6Nf9ujQip6iRjsw",
                globalCfg,
            )
            .catch(() => null);

        expect(token).toBeFalsy();
    });
    test("deserializing expired token", async () => {
        const globalCfg: ConfigOptions = {
            cookieName: "orange.auth",
            secret: "secret-key",
            cookieSettings: {},
            strategy: new JWT(),
            callbacks: {
                login: () => false,
            },
            providers: [],
        };

        const token = await globalCfg.strategy
            .deserialize(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNvbWUgdXNlciIsImlhdCI6MTc1NDg0MTA1NCwiZXhwIjoxNzU0ODQxMDc5fQ.FcjpJW4sznO9W1aFYrxCpBsEhLv57m1iFX9qRx3tlJY",
                globalCfg,
            )
            .catch(() => null);

        expect(token).toBeFalsy();
    });
});
