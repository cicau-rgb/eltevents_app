import { createElement } from "react";
import ResetPassword, { resetPasswordSubject } from "../emails/reset-password";
import VerifyEmail, { verifyEmailSubject } from "../emails/verify-email";

// Queue jobs are JSON, so they carry a template id and variables; the worker
// turns them into a subject and a React Email element here. The templates
// themselves live in emails/.
export type EmailTemplate =
  | { id: "verify-email"; variables: { USER_NAME: string; ACTION_URL: string } }
  | {
      id: "reset-password";
      variables: { USER_NAME: string; ACTION_URL: string };
    };

export function buildEmail(template: EmailTemplate) {
  const props = {
    userName: template.variables.USER_NAME || "there",
    actionUrl: template.variables.ACTION_URL,
  };
  switch (template.id) {
    case "verify-email":
      return {
        subject: verifyEmailSubject,
        react: createElement(VerifyEmail, props),
      };
    case "reset-password":
      return {
        subject: resetPasswordSubject,
        react: createElement(ResetPassword, props),
      };
  }
}
