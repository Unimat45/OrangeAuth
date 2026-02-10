import type { MaybePromise } from "../@types/globals";
import type { ConfigOptions } from "../@types/internals";
import type { IProvider } from "../providers/index";

interface IActionParams {
    globalCfg: ConfigOptions;
    req: Request;
    provider: IProvider;
}

interface IAction {
    (params: IActionParams): MaybePromise<Response>;
}

export type { IAction };
