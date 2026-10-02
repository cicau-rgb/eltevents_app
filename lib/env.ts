import { z } from "zod";

// The only module that reads process.env. Each process validates just the
// variables it uses: the web app needs the auth settings, the worker needs
// SMTP, and both need the database. A missing or malformed variable fails
// immediately with one message that lists everything that is wrong.
const baseSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

const webSchema = baseSchema.extend({
  // Generate with: openssl rand -base64 32
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

const workerSchema = baseSchema.extend({
  SMTP_URL: z.url({ protocol: /^smtps?$/ }),
  // Set to an address on a domain verified with your SMTP provider. Empty
  // counts as unset.
  EMAIL_FROM: z
    .string()
    .optional()
    .transform((value) => value || "ELTE Events <noreply@localhost>"),
});

const cache = new Map<z.ZodType, unknown>();

function load<T extends z.ZodType>(schema: T): z.output<T> {
  if (cache.has(schema)) return cache.get(schema) as z.output<T>;

  // Escape hatch for builds that run without the runtime environment, e.g.
  // `SKIP_ENV_VALIDATION=1 next build` in CI or a Docker build.
  if (process.env.SKIP_ENV_VALIDATION) {
    return process.env as z.output<T>;
  }

  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables (see .env.example):\n${z.prettifyError(result.error)}`,
    );
  }
  cache.set(schema, result.data);
  return result.data;
}

export const baseEnv = () => load(baseSchema);
export const webEnv = () => load(webSchema);
export const workerEnv = () => load(workerSchema);
