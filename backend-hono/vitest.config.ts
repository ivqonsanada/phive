import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
  const migrations = await readD1Migrations("./migrations");

  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
            APP_KEY: "test-app-key-0123456789abcdef",
            MAIL_DRIVER: "array",
            APP_URL: "http://localhost:8787",
            FRONTEND_URL: "http://localhost:3000",
            DEMO_MODE: "false",
            LECTURER_EMAIL_PATTERN: "^[a-zA-Z0-9._%+-]+@(?!.*student).*\\.ac\\.id$",
          },
        },
      }),
    ],
    test: {
      setupFiles: ["./test/setup.ts"],
    },
  };
});
