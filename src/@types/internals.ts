import type { ConfigOptionsProps } from "../lib";

/**
 * Internally used version of the options
 */
export type ConfigOptions = Required<Omit<ConfigOptionsProps, "basePath">>;
