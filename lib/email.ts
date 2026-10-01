import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// The default sandbox sender only delivers to your own Resend account email.
// Set EMAIL_FROM once a domain is verified in Resend.
const from = process.env.EMAIL_FROM || "ELTE Events <onboarding@resend.dev>";

// Aliases of the published templates in the Resend dashboard (Templates).
// Each template's variables are listed next to its alias.
export type EmailTemplate =
  | { id: "verify-email"; variables: { USER_NAME: string; ACTION_URL: string } }
  | {
      id: "reset-password";
      variables: { USER_NAME: string; ACTION_URL: string };
    };

type SendEmailInput = {
  to: string;
  template: EmailTemplate;
  // Same key + same payload within 24h is not sent twice, so retries are safe.
  idempotencyKey?: string;
};

export async function sendEmail({
  to,
  template,
  idempotencyKey,
}: SendEmailInput) {
  const { error } = await resend.emails.send(
    { from, to: [to], template },
    idempotencyKey ? { idempotencyKey } : undefined,
  );
  // The SDK returns errors instead of throwing.
  if (error) {
    throw new Error(
      `Resend failed to send template "${template.id}": ${error.message}`,
    );
  }
}
