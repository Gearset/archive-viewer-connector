import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginJest from "eslint-plugin-jest";

export default tseslint.config(
    { ignores: ["dist"] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked
        ],
        ignores: ["**/__tests__/**"],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...pluginJest.environments.globals.globals
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname + "/force-app/main/default"
            }
        }
    },
    {
        files: ["**/__tests__/*.{ts,tsx}"],
        ...pluginJest.configs["flat/recommended"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...pluginJest.environments.globals.globals
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname + "/force-app/main/default"
            }
        },
        plugins: { jest: pluginJest },
        rules: {
            ...pluginJest.configs["flat/recommended"].rules,
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-assignment": "off"
        }
    }
);
