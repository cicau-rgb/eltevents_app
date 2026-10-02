import { enqueueEmail } from "../lib/queue";

// Queues a test email through the same pg-boss queue the auth hooks use. The
// worker (`pnpm worker`) sends it. Usage: pnpm email:test [recipient]
async function main() {
  const to = process.argv[2] ?? "test@example.com";

  const queued = await enqueueEmail({
    to,
    template: {
      id: "verify-email",
      variables: {
        USER_NAME: "Test User",
        ACTION_URL: "http://localhost:3000/api/auth/verify-email?token=test",
      },
    },
  });

  if (queued) console.log(`Queued test email for ${to}`);
  // The queue client keeps a connection pool open, so exit explicitly.
  process.exit(queued ? 0 : 1);
}

main();
