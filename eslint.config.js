import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "**/dist/**",
      "coverage/**",
      "**/coverage/**",
      "node_modules/**",
      "**/node_modules/**",
      ".changeset/**",
      "pnpm-lock.yaml",
      // Vendored verbatim from the main branch (v1 editor); not hand-maintained.
      "packages/editor/src/vendor/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-console": "off",
    },
  }
);
