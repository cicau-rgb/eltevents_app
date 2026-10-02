import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Section,
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

const font = "Arial,Helvetica,sans-serif";

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
      <Body style={{ margin: 0, padding: 0, backgroundColor: "#f3f4f6" }}>
        <Section style={{ padding: "24px 16px" }}>
          <Container
            style={{
              maxWidth: "600px",
              backgroundColor: "#ffffff",
              padding: "32px",
            }}
          >
            <Heading
              as="h1"
              style={{
                margin: "0 0 16px",
                fontFamily: font,
                fontSize: "24px",
                lineHeight: "32px",
                color: "#1f2937",
              }}
            >
              {title}
            </Heading>
            <Text style={{ ...paragraph, margin: "0 0 16px" }}>
              Hi {userName},
            </Text>
            <Text style={{ ...paragraph, margin: "0 0 24px" }}>{body}</Text>
            <Button
              href={actionUrl}
              style={{
                backgroundColor: "#111827",
                borderRadius: "4px",
                padding: "12px 20px",
                fontFamily: font,
                fontSize: "16px",
                lineHeight: "24px",
                color: "#ffffff",
                textDecoration: "none",
              }}
            >
              {buttonLabel}
            </Button>
            <Text
              style={{
                margin: "24px 0 0",
                fontFamily: font,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#4b5563",
              }}
            >
              If you did not request this, you can ignore this email.
            </Text>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}

const paragraph = {
  fontFamily: font,
  fontSize: "16px",
  lineHeight: "24px",
  color: "#1f2937",
};
