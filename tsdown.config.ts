import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/index.ts", "src/providers/index", "src/strategies/index"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    treeshake: true,
    exports: true,
    publint: true,
    attw: {
        // This tells ATTW to focus on modern resolution modes
        profile: "node16",
    },
    // tsdown will now read your "engines" field and
    // automatically target the correct JS syntax
    target: "node20",
});
