import { createHash } from "node:crypto";
import { enqueueEmail } from "./queue";

type AuthEmailData = {
  user: { id: string; name: string; email: string };
  url: string;
  token: string;
};

// Resend rejects idempotency keys over 256 characters, and the verification
// token is a JWT that contains the user's email, so it can be arbitrarily long.
// Hash it: the key stays bounded and still unique per token. The link the user
// receives (url) is unchanged.
function idempotencyKey(type: string, token: string) {
  return `${type}/${createHash("sha256").update(token).digest("hex")}`;
}

// The hooks only enqueue; the worker (worker/index.ts) calls Resend. Better
// Auth runs these in the background (advanced.backgroundTasks in lib/auth.ts),
// so their duration never shows up in the response time.
export function sendVerificationEmail({ user, url, token }: AuthEmailData) {
  return enqueueEmail({
    to: user.email,
    template: {
      id: "verify-email",
      variables: { USER_NAME: user.name, ACTION_URL: url },
    },
    idempotencyKey: idempotencyKey("verify-email", token),
  });
}

export function sendResetPasswordEmail({ user, url, token }: AuthEmailData) {
  return enqueueEmail({
    to: user.email,
    template: {
      id: "reset-password",
      variables: { USER_NAME: user.name, ACTION_URL: url },
    },
    idempotencyKey: idempotencyKey("reset-password", token),
  });
}
