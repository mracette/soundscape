import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-electron",
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  reporter: "list",
});
