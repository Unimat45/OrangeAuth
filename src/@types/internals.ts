import type { RequiredDeep } from "type-fest";
import type { ConfigOptionsProps } from "./globals";

/**
 * Internally used version of the options
 */
export type ConfigOptions = Omit<RequiredDeep<Omit<ConfigOptionsProps, "basePath">>, "cookieSettings"> & {
    // Some cookieSettings can be null, but not the field itself
    cookieSettings: NonNullable<ConfigOptionsProps["cookieSettings"]>;
};

/**
 * Maybe there is a value, maybe not 🤷‍♂️
 */
export type Maybe<T> = T | null | undefined;
