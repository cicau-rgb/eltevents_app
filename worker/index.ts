import { PgBoss } from "pg-boss";
import { sendEmail } from "../lib/email";
import { SEND_EMAIL_QUEUE, type SendEmailJob } from "../lib/queue";

// Long-running process: owns the pgboss schema and sends the queued emails.
// Needs DATABASE_URL, RESEND_API_KEY and (optionally) EMAIL_FROM.
async function main() {
  const boss = new PgBoss({ connectionString: process.env.DATABASE_URL });
  boss.on("error", console.error);

  await boss.start();
  await boss.createQueue(SEND_EMAIL_QUEUE);

  // sendEmail throws on Resend errors, so pg-boss retries the job.
  await boss.work<SendEmailJob>(SEND_EMAIL_QUEUE, async ([job]) => {
    await sendEmail(job.data);
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
