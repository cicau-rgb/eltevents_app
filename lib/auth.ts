import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";
import { sendResetPasswordEmail, sendVerificationEmail } from "./auth-emails";
import { db } from "./db";
import { webEnv } from "./env";

// Fail at startup (first import) if the auth settings are missing.
webEnv();

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (data) => sendResetPasswordEmail(data),
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async (data) => sendVerificationEmail(data),
  },
  advanced: {
    // Better Auth only calls the email hooks for existing accounts and awaits
    // them unless a handler is set, so awaiting would make the response time
    // reveal which addresses are registered. after() runs them once the
    // response is sent and keeps a serverless invocation alive until they settle.
    backgroundTasks: { handler: (promise) => after(promise) },
  },
  // Must stay the last plugin so server actions can set cookies.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
