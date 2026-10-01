import { enqueueEmail } from "./queue";

type AuthEmailData = {
  user: { id: string; name: string; email: string };
  url: string;
  token: string;
};

// The hooks only enqueue; the worker (worker/index.ts) calls Resend. Enqueuing
// is a single insert for known and unknown accounts alike, so response time
// still doesn't reveal whether an account exists.
export function sendVerificationEmail({ user, url, token }: AuthEmailData) {
  return enqueueEmail({
    to: user.email,
    template: {
      id: "verify-email",
      variables: { USER_NAME: user.name, ACTION_URL: url },
    },
    idempotencyKey: `verify-email/${user.id}/${token}`,
  });
}

export function sendResetPasswordEmail({ user, url, token }: AuthEmailData) {
  return enqueueEmail({
    to: user.email,
    template: {
      id: "reset-password",
      variables: { USER_NAME: user.name, ACTION_URL: url },
    },
    idempotencyKey: `reset-password/${user.id}/${token}`,
  });
}
