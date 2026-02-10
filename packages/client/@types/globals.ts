import type { ConfigOptionsProps } from "../../orange-auth/@types/globals";
import type { IProvider } from "../../orange-auth/providers";

export type ClientConfigOptions = Pick<ConfigOptionsProps, "basePath" | "cookieName"> & {
    providers: IProvider["ID"][];
};
