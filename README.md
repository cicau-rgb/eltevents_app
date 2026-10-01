This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# eltevents_app

## Authentication

Auth uses [Better Auth](https://better-auth.com) (email + password) inside Next.js, with Postgres via Drizzle. There are no auth pages yet; the API is exposed under `/api/auth/*`.

- `lib/auth.ts` is the server config; `lib/auth-client.ts` is the React client.
- `lib/session.ts` has `getSession()` and `requireSession()` (redirects to `SIGN_IN_PATH`). Call it in server components, route handlers and server actions.
- `proxy.ts` is an optimistic cookie check for protected paths (the `matcher`); it is not a security boundary.
- `lib/db/auth-schema.ts` is generated: `npx auth@latest generate --config lib/auth.ts --output lib/db/auth-schema.ts`, then `pnpm db:generate` and `pnpm db:migrate`. Re-run after adding plugins.

Setup: start Postgres with `docker compose up -d` (`compose.yaml`; the default `DATABASE_URL` in `.env.example` matches it), copy `.env.example` to `.env`, fill in `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), then run `pnpm db:migrate`.

Inspect the database with `pnpm db:studio` (Drizzle Studio, default port 4983, bound to localhost; local use only). For raw SQL: `docker compose exec postgres psql -U postgres -d eltevents`.

Email: [Resend](https://resend.com) sends the auth emails. `lib/email.ts` is the sender and `lib/auth-emails.ts` adapts it to Better Auth's `sendVerificationEmail` / `sendResetPassword` hooks. The email bodies are **templates hosted in Resend** (dashboard → Templates), referenced by alias: `verify-email` and `reset-password`, each with the variables `USER_NAME` and `ACTION_URL`. Edit the copy in the dashboard and publish; no deploy needed. A different Resend account (e.g. production) needs the same two templates published under the same aliases, and a renamed variable fails at send time. Set `RESEND_API_KEY` (and `EMAIL_FROM` once you have a verified domain; the default sandbox sender only delivers to your own Resend account email). Verification mails go out on sign-up; sign-in is not yet blocked for unverified users (`requireEmailVerification`).

Not done yet: a reset-password page (the reset email links to `/api/auth/reset-password/:token`, which needs a `redirectTo` page when requesting the reset), OAuth providers, rate-limit and `trustedOrigins` review before production.
