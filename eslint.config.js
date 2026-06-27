import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default [
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
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Off: the codebase leans on `as any` for three.js interop
      // (@types/three@0.103 vs three@0.108 runtime) and dynamic shapes.
      "@typescript-eslint/no-explicit-any": "off",
      // The `cond && sideEffect()` short-circuit is an established pattern in
      // this codebase; eslint:recommended never flagged it.
      "@typescript-eslint/no-unused-expressions": "off",
      // Pre-existing `arguments`-forwarding bind helper (FirstPersonControls);
      // advisory only, not rewritten in this behavior-identical migration.
      "prefer-rest-params": "warn",
      // React Compiler diagnostics (P9, via eslint-plugin-react-hooks 7 `recommended`).
      // These fire on deliberate imperative escape hatches we do NOT rewrite: viz ref
      // access during render (Icon, CanvasFade), WebAudio gain mutation + effect-driven
      // setState (ToggleButton, ToggleButtonGroup). Advisory only, consistent with this
      // project's lint posture; the compiler bails or is opted out at runtime.
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];
