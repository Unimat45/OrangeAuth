import { verify as baseVerify, type JwtPayload, type PublicKey, type Secret, type VerifyOptions } from "jsonwebtoken";

// The sign function is fine as-is
export { sign } from "jsonwebtoken";

/**
 * Promisified version of the jwt's verify function.
 * @param token The user's token.
 * @param secretOrPublicKey Your secret key, or a public key.
 * @param options Jwt options.
 * @returns The user's payload, or null on errors.
 */
export function verify<T extends JwtPayload = JwtPayload>(
    token: string,
    secretOrPublicKey: Secret | PublicKey,
    options?: VerifyOptions,
) {
    return new Promise<T | null>((resolve) => {
        baseVerify(token, secretOrPublicKey, { ...options, complete: false }, (err, payload) => {
            // In case of error, it is assumed as a malicious token, so we invalidate it.
            if (err?.cause) resolve(null);
            resolve(payload as T);
        });
    });
}
