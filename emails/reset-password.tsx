import { ActionEmailLayout, type ActionEmailProps } from "./action-email";

export const resetPasswordSubject = "Reset your password";

export default function ResetPassword(props: ActionEmailProps) {
  return (
    <ActionEmailLayout
      {...props}
      title="Reset your password"
      body="We received a request to reset your ELTE Events password. This link expires in one hour."
      buttonLabel="Reset password"
    />
  );
}

ResetPassword.PreviewProps = {
  userName: "Anna",
  actionUrl: "http://localhost:3000/api/auth/reset-password/example",
} satisfies ActionEmailProps;
