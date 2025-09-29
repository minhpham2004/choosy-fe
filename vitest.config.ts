import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    reporters: ["default", "junit"],
    setupFiles: "./src/setupTest.ts",
    outputFile: {
      junit: "junit.xml",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "cobertura"],
      reportsDirectory: "./coverage",
    },
  },
});
