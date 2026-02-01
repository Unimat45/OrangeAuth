// @ts-check

/** @type {import("prettier").Config} */
export default {
    printWidth: 120,
    useTabs: false,
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    importOrder: ["<THIRD_PARTY_MODULES>", "^~/(.*)$", "^[./]"],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    importOrderCaseInsensitive: true,
    plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-brace-style", "prettier-plugin-merge"],
    braceStyle: "stroustrup",
};
