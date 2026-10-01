import { sendEmail } from "./email";

type AuthEmailData = {
  user: { id: string; name: string; email: string };
  url: string;
  token: string;
};

// Better Auth docs: don't await these in the hook, so response time doesn't
// reveal whether an account exists. Failures are logged instead.
export function sendVerificationEmail({ user, url, token }: AuthEmailData) {
  sendEmail({
    to: user.email,
    template: {
      id: "verify-email",
      variables: { USER_NAME: user.name, ACTION_URL: url },
    },
    idempotencyKey: `verify-email/${user.id}/${token}`,
  }).catch(console.error);
}

export function sendResetPasswordEmail({ user, url, token }: AuthEmailData) {
  sendEmail({
    to: user.email,
    template: {
      id: "reset-password",
      variables: { USER_NAME: user.name, ACTION_URL: url },
    },
    idempotencyKey: `reset-password/${user.id}/${token}`,
  }).catch(console.error);
}
