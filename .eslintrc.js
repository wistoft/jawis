module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  plugins: ["react", "@typescript-eslint", "unused-imports", "import"],

  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },

  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },

  ignorePatterns: [".vscode/tasks.json", "vendor"],

  rules: {
    "@typescript-eslint/no-unused-vars": "off", //replaced by unused-imports
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "(^_)|prov",
      },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-var-requires": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "import/no-extraneous-dependencies": ["error"],
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
};
