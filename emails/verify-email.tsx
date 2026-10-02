import { ActionEmailLayout, type ActionEmailProps } from "./action-email";

export const verifyEmailSubject = "Verify your email";

export default function VerifyEmail(props: ActionEmailProps) {
  return (
    <ActionEmailLayout
      {...props}
      title="Verify your email"
      body="Thanks for signing up for ELTE Events. Confirm your email address to finish creating your account."
      buttonLabel="Verify email"
    />
  );
}

VerifyEmail.PreviewProps = {
  userName: "Anna",
  actionUrl: "http://localhost:3000/api/auth/verify-email?token=example",
} satisfies ActionEmailProps;
