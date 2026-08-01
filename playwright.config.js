import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT || 3000;

export default defineConfig({
  testDir: "./e2e",
  // CI fetches all audio/model assets from the CDN over the network, so scene-load
  // + interaction tests need more headroom than the local-asset run.
  timeout: process.env.CI ? 120_000 : 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}` },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
      },
    },
    {
      name: "webkit",
      testMatch: /smoke\.spec\.js/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: `pnpm start --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
