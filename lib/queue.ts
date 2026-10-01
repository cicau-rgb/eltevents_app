import { PgBoss } from "pg-boss";
import type { EmailTemplate } from "./email";

export const SEND_EMAIL_QUEUE = "send-email";

export type SendEmailJob = {
  to: string;
  template: EmailTemplate;
  // Passed on to Resend, so a retried job is never delivered twice.
  idempotencyKey: string;
};

// Producer client: no maintenance, no scheduling, no LISTEN connection. It does
// install the pgboss schema and create the queue if they are missing (both are
// idempotent and safe to run concurrently with the worker), so a request that
// arrives on a fresh database before the worker has ever started still queues
// its email instead of losing it. Kept on globalThis so dev hot reloads and
// warm serverless instances reuse one small pool.
const globalForBoss = globalThis as unknown as {
  boss?: Promise<PgBoss>;
};

async function startBoss() {
  const boss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    supervise: false,
    schedule: false,
    useListenNotify: false,
  });
  boss.on("error", console.error);
  await boss.start();
  await boss.createQueue(SEND_EMAIL_QUEUE);
  return boss;
}

function getBoss() {
  if (!globalForBoss.boss) {
    const started = startBoss();
    // Don't cache a failed start, so the next request tries again.
    started.catch(() => {
      globalForBoss.boss = undefined;
    });
    globalForBoss.boss = started;
  }
  return globalForBoss.boss;
}

// Enqueuing is one INSERT, so it is safe to await inside a request and the job
// survives the function being frozen afterwards. Failures are logged, not
// thrown, so the auth response does not depend on the queue.
export async function enqueueEmail(job: SendEmailJob) {
  try {
    const boss = await getBoss();
    await boss.send(SEND_EMAIL_QUEUE, job, {
      retryLimit: 5,
      retryDelay: 30,
      retryBackoff: true,
      // The payload holds a one-time token URL; don't keep finished jobs long.
      deleteAfterSeconds: 60 * 60,
    });
  } catch (error) {
    console.error(`Failed to enqueue "${job.template.id}" email`, error);
  }
}
