import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["**/*.js"],
      exclude: ["index.js", "config/llm.js"],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 80,
      },
    },
  },
});
