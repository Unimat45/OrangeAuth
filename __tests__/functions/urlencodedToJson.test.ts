import { describe, expect, test } from "vitest";
import { urlencodedToJson } from "../../src/functions";

describe("Test if converting to JSON from a urlencoded works", () => {
    test("A good string", () => {
        const baseStr = "email=bob.b%40somedomain.com&password=StrongPassword1234%24";

        const result = urlencodedToJson(baseStr);

        expect(result).toMatchObject({
            email: "bob.b@somedomain.com",
            password: "StrongPassword1234$",
        });
    });
    test("A bad string", () => {
        const baseStr = "email=bob.b%40somedomain.com&passwordStrongPassword1234%24&userName=Bob";

        const result = urlencodedToJson(baseStr);

        expect(result).toMatchObject({
            email: "bob.b@somedomain.com",
            userName: "Bob"
        });
    });
    test("An empty string", () => {
        const baseStr = "";

        const result = urlencodedToJson(baseStr);

        expect(result).toMatchObject({});
    });
});
