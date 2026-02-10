import type { ClientConfigOptions } from "./@types/globals";

type LogInProps = {
    credentials: Record<"email" | "password", string>;
};

type Opts = Partial<{ callbackUrl: string }>;

function createAuthClient(options: ClientConfigOptions) {
    async function logIn<T extends keyof LogInProps>(provider: T, credentials: LogInProps[T], opts?: Opts) {
        const res = await fetch(`${options.basePath}/login/${provider}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(credentials),
        });

        if (!res.ok) {
            throw new Error("INVALID_CREDENTIALS");
        }

        if (opts?.callbackUrl) {
            window.location.replace(opts.callbackUrl);
        }
    }

    async function logOut(opts?: Opts) {
        const res = await fetch(`${options.basePath}/logout/credentials`, {
            method: "POST",
        });

        if (!res.ok) {
            throw new Error("SERVER_ERROR");
        }

        if (opts?.callbackUrl) {
            window.location.replace(opts.callbackUrl);
        }
    }

    return {
        logIn,
        logOut,
    };
}

export { createAuthClient };
export type { ClientConfigOptions };
