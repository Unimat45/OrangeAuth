import {
    verify as baseVerify,
    type JwtPayload,
    type PublicKey,
    type Secret,
    type VerifyOptions,
} from "jsonwebtoken";

export { sign } from "jsonwebtoken";

export function verify<T extends JwtPayload = JwtPayload>(
    token: string,
    secretOrPublicKey: Secret | PublicKey,
    options?: VerifyOptions,
) {
    return new Promise<T | null>((resolve) => {
        baseVerify(token, secretOrPublicKey, { ...options, complete: false }, (err, payload) => {
            if (err) resolve(null);
            resolve(payload as T);
        });
    });
}

