import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default [
    {
        ignores: ["**/*.js", "**/*.d.ts", "prh-rules/**"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        rules: {
            "curly": "error",
            "eqeqeq": ["error", "smart"],
            "no-eval": "error",
            "no-debugger": "error",
            "no-var": "error",
            "prefer-const": "error",
            "prefer-template": "error",
            "radix": "error",
            "use-isnan": "error",
            "no-caller": "error",
            "no-bitwise": "error",
            "new-parens": "error",
            "@typescript-eslint/no-namespace": ["error", { "allowDeclarations": true }],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-require-imports": "off",
        },
    },
];
