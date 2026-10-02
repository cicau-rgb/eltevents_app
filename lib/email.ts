import nodemailer, { type Transporter } from "nodemailer";
import type { ReactElement } from "react";
import { render } from "react-email";

// SMTP_URL is read lazily so importing this module never fails; sending does.
// Locally it points at Mailpit; staging/production use the provider's SMTP
// URL (see .env.example). Pooled so the long-running worker reuses connections.
let transporter: Transporter | undefined;

function getTransporter() {
  if (!transporter) {
    const url = process.env.SMTP_URL;
    if (!url) throw new Error("SMTP_URL is not set");
    transporter = nodemailer.createTransport({ url, pool: true });
  }
  return transporter;
}

// Falls back to a placeholder sender; set EMAIL_FROM to an address on a domain
// verified with your SMTP provider.
const from = process.env.EMAIL_FROM || "ELTE Events <noreply@localhost>";

type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

// Renders the React Email component to HTML (and a plain-text alternative) and
// sends it over SMTP. Throws on failure, so the pg-boss worker retries the job.
export async function sendEmail({ to, subject, react }: SendEmailInput) {
  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ]);
  await getTransporter().sendMail({ from, to, subject, html, text });
}
