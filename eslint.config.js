import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-param-reassign": ["error", { props: false }],
      "unicorn/no-abusive-eslint-disable": "off",
      "class-methods-use-this": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "unicorn/no-null": "off",
    },
    languageOptions: {
      parserOptions: {
        sourceType: "module",
      },
    },
    ignores: ["dist", "node_modules"],
  },
];
