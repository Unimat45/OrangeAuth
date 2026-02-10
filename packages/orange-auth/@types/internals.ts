import type { RequiredDeep } from "type-fest";

import type { ConfigOptionsProps } from "./globals";

type ConfigOptsRequired = RequiredDeep<Omit<ConfigOptionsProps, "basePath" | "callbacks" | "cookieSettings">>;

/**
 * Internally used version of the options
 */
export type ConfigOptions = ConfigOptsRequired & {
    // Some cookieSettings can be null, but not the field itself
    cookieSettings: NonNullable<ConfigOptionsProps["cookieSettings"]>;
    callbacks?: ConfigOptionsProps["callbacks"];
};

/**
 * Maybe there is a value, maybe not 🤷‍♂️
 */
export type Maybe<T> = T | null | undefined;
