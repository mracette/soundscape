const js = require("@eslint/js");
const globals = require("globals");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");
const tseslint = require("typescript-eslint");

module.exports = [
  { ignores: ["build/**", "node_modules/**", "e2e/**", "*.config.js"] },
  // Keep eslint-disable directives carried over from the pre-TS source even
  // when the rule doesn't currently fire, so --fix doesn't strip them.
  { linterOptions: { reportUnusedDisableDirectives: "off" } },
  js.configs.recommended,
  ...tseslint.configs.recommended.map((c) => ({
    ...c,
    files: ["src/**/*.{ts,tsx}"],
  })),
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      // Deliberate `as any` casts preserve runtime where types are imperfect
      // (older @types/three, dynamic WebAudio shapes); advisory, not blocking.
      "@typescript-eslint/no-explicit-any": "warn",
      // The `cond && sideEffect()` short-circuit is an established pattern in
      // this codebase; eslint:recommended never flagged it.
      "@typescript-eslint/no-unused-expressions": "off",
      // Pre-existing `arguments`-forwarding bind helper (FirstPersonControls);
      // advisory only, not rewritten in this behavior-identical migration.
      "prefer-rest-params": "warn",
    },
  },
];
