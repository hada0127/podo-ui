import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "packages/studio/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1",
    trace: "retain-on-failure",
  },
});
