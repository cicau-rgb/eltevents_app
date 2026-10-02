import { defineConfig } from "drizzle-kit";
import { baseEnv } from "./lib/env";

export default defineConfig({
  schema: "./lib/db/auth-schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: baseEnv().DATABASE_URL,
  },
});
