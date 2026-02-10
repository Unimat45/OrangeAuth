import { defineConfig, type UserConfig } from "tsdown";

const DISCLAIMER = `/*
    Orange Auth, a simple modular auth library
    Copyright (C) 2026  Mathieu Dery

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/`;

const commonConfig = {
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    treeshake: true,
    publint: true,
    inlineOnly: ["type-fest"],
    target: "node20",
    attw: {
        profile: "esm-only",
    },
    banner: DISCLAIMER,
} satisfies UserConfig;

export default defineConfig([
    {
        entry: {
            index: "packages/orange-auth/index.ts",
            providers: "packages/orange-auth/providers/index",
            strategies: "packages/orange-auth/strategies/index",
        },
        ...commonConfig,
    },
    {
        entry: {
            client: "packages/client/index.ts",
        },
        platform: "browser",
        ...commonConfig,
    },
]);
