import { PgBoss } from "pg-boss";
import { sendEmail } from "../lib/email";
import { buildEmail } from "../lib/email-templates";
import { workerEnv } from "../lib/env";
import { SEND_EMAIL_QUEUE, type SendEmailJob } from "../lib/queue";

// Long-running process that sends the queued emails (maintenance, retries).
// Needs DATABASE_URL, SMTP_URL and (optionally) EMAIL_FROM.
async function main() {
  // Fail before connecting to anything if the environment is incomplete.
  const env = workerEnv();
  const boss = new PgBoss({ connectionString: env.DATABASE_URL });
  boss.on("error", console.error);

  await boss.start();
  await boss.createQueue(SEND_EMAIL_QUEUE);

  // sendEmail throws on SMTP errors, so pg-boss retries the job.
  await boss.work<SendEmailJob>(SEND_EMAIL_QUEUE, async ([job]) => {
    await sendEmail({ to: job.data.to, ...buildEmail(job.data.template) });
  });

  console.log(`Worker listening on "${SEND_EMAIL_QUEUE}"`);

  async function shutdown() {
    await boss.stop({ graceful: true });
    process.exit(0);
  }
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
