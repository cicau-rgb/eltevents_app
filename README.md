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

Email: provider-independent. `lib/email.ts` exports `sendEmail({ to, subject, react })`, which renders a [React Email](https://react.email) component to HTML plus plain text and sends it over SMTP with [Nodemailer](https://nodemailer.com), using `SMTP_URL` (and `EMAIL_FROM` for the sender). The templates are components in `emails/` (`verify-email.tsx`, `reset-password.tsx`, sharing `action-email.tsx`), so all email content lives in git; `lib/email-templates.ts` maps a queue job's template id and variables (`USER_NAME`, `ACTION_URL`) to a subject and component. `lib/auth-emails.ts` adapts this to Better Auth's `sendVerificationEmail` / `sendResetPassword` hooks. Locally `SMTP_URL=smtp://localhost:1025` points at [Mailpit](https://mailpit.axllent.org) (`docker compose up -d`; every message shows up at http://localhost:8025). For staging use your provider's SMTP URL, e.g. Resend: `smtps://resend:<api key>@smtp.resend.com:465`, with `EMAIL_FROM` on a verified domain. The auth hooks do not send themselves: they enqueue a job with [pg-boss](https://github.com/timgit/pg-boss) (`lib/queue.ts`, one insert into Postgres), so the send survives serverless functions being frozen after the response. A separate long-running **worker** (`worker/index.ts`) takes the jobs and sends them; failed sends retry up to 5 times with backoff (SMTP has no idempotency key, so a send that succeeded but was not acknowledged can be delivered twice). Run it with `pnpm worker` (second terminal locally; its own process/container in production, with `DATABASE_URL`, `SMTP_URL` and `EMAIL_FROM`, e.g. `pnpm worker:start`). The repo's `Dockerfile` builds a worker-only image (the Next.js app is deployed separately); `docker compose --profile worker up -d --build` runs it next to the local Postgres and Mailpit (its `SMTP_URL` is set to Mailpit in `compose.yaml`; `EMAIL_FROM` comes from `.env`, leave it out rather than empty). `pnpm email:test [recipient]` queues a test email through the same queue. Both the web app and the worker create the `pgboss` schema and the `send-email` queue if they are missing (idempotent), so start order doesn't matter. While the worker is down, emails wait in the queue and are sent when it comes back. Finished jobs are deleted after 1 hour because the payload contains one-time token links. Verification mails go out on sign-up; sign-in is not yet blocked for unverified users (`requireEmailVerification`).

Not done yet: a reset-password page (the reset email links to `/api/auth/reset-password/:token`, which needs a `redirectTo` page when requesting the reset), OAuth providers, rate-limit and `trustedOrigins` review before production.
