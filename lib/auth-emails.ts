import { enqueueEmail } from "./queue";

type AuthEmailData = {
  user: { id: string; name: string; email: string };
  url: string;
};

// The hooks only enqueue; the worker (worker/index.ts) sends them. Better
// Auth runs these in the background (advanced.backgroundTasks in lib/auth.ts),
// so their duration never shows up in the response time.
export async function sendVerificationEmail({ user, url }: AuthEmailData) {
  await enqueueEmail({
    to: user.email,
    template: {
      id: "verify-email",
      variables: { USER_NAME: user.name, ACTION_URL: url },
    },
  });
}

export async function sendResetPasswordEmail({ user, url }: AuthEmailData) {
  await enqueueEmail({
    to: user.email,
    template: {
      id: "reset-password",
      variables: { USER_NAME: user.name, ACTION_URL: url },
    },
  });
}
