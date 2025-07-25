import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    ignores: ["packages/dev/**/*", "packages/tests/**/*"],
  },

  eslint.configs.recommended,

  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },

    languageOptions: {
      parser: tseslint.parser,

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  {
    // disable type-aware linting on JS files
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },

  importPlugin.flatConfigs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },

    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },

    rules: {
      "import/no-duplicates": ["error"],
      "import/no-self-import": ["error"],
      "import/export": ["error"],
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "parent", "sibling"],
          pathGroups: [
            {
              pattern: "^**",
              group: "external",
              position: "after",
            },
            {
              pattern: "^*/**",
              group: "external",
              position: "after",
            },
          ],
        },
      ],
    },
  }
);
