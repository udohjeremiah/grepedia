import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface ChangeEmailConfirmationEmailProps {
  logo: string;
  newEmail: string;
  username: string;
  verificationLink: string;
}

export function ChangeEmailConfirmationEmail({
  logo,
  newEmail,
  username,
  verificationLink,
}: ChangeEmailConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="bg-[#f4f4f5] py-2.5">
          <Preview>Grepedia - approve your email change</Preview>
          <Container className="border border-solid border-[#e4e4e7] bg-white p-11.25">
            <Img alt="Grepedia" height="40" src={logo} width="40" />
            <Section>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                Hi {username},
              </Text>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                We received a request to change your Grepedia account email to{" "}
                {newEmail}. If this was you, approve the request below:
              </Text>
              <Button
                className="block w-52.5 rounded bg-[#0085c8] px-1.75 py-3.5 text-center text-[15px] text-white no-underline"
                href={verificationLink}
              >
                Approve Email Change
              </Button>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                If you did not request this change, ignore this email. Your
                current email will remain unchanged.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ChangeEmailConfirmationEmail.PreviewProps = {
  logo: "http://localhost:3000/favicon-96x96.png",
  newEmail: "newmail@example.com",
  username: "alanturing",
  verificationLink: "http://localhost:3000/approve-email-change",
} as ChangeEmailConfirmationEmailProps;
