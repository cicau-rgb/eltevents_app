import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Tailwind,
  Text,
} from "react-email";

// Shared layout of the transactional emails that ask the user to follow one
// link: heading, greeting, a paragraph, a button and an ignore notice.
export type ActionEmailProps = {
  userName: string;
  actionUrl: string;
};

type ActionEmailLayoutProps = ActionEmailProps & {
  title: string;
  body: string;
  buttonLabel: string;
};

export function ActionEmailLayout({
  title,
  userName,
  body,
  actionUrl,
  buttonLabel,
}: ActionEmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <title>{title}</title>
      </Head>
      <Tailwind>
        <Body>
          <Container>
            <Heading as="h1">{title}</Heading>
            <Text>Hi {userName},</Text>
            <Text>{body}</Text>
            <Button href={actionUrl}>{buttonLabel}</Button>
            <Text>If you did not request this, you can ignore this email.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
