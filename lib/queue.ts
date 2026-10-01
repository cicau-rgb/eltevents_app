import { PgBoss } from "pg-boss";
import type { EmailTemplate } from "./email";

export const SEND_EMAIL_QUEUE = "send-email";

export type SendEmailJob = {
  to: string;
  template: EmailTemplate;
  // Passed on to Resend, so a retried job is never delivered twice.
  idempotencyKey: string;
};

// Send-only client: start() just opens the pool and checks the schema exists
// (no maintenance, no scheduling, no migration, no LISTEN connection). The
// worker (worker/index.ts) owns the schema and the queue. Kept on globalThis so
// dev hot reloads and warm serverless instances reuse one small pool.
const globalForBoss = globalThis as unknown as {
  boss?: Promise<PgBoss>;
};

function getBoss() {
  if (!globalForBoss.boss) {
    const boss = new PgBoss({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      supervise: false,
      schedule: false,
      migrate: false,
      useListenNotify: false,
    });
    boss.on("error", console.error);
    const started = boss.start();
    // Don't cache a failed start (e.g. worker hasn't created the schema yet).
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
