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

interface ResetPasswordEmailProps {
  logo: string;
  resetLink: string;
  username: string;
}

export function ResetPasswordEmail({
  logo,
  resetLink,
  username,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="bg-[#f4f4f5] py-2.5">
          <Preview>Grepedia — reset your password</Preview>
          <Container className="border border-solid border-[#e4e4e7] bg-white p-11.25">
            <Img alt="Grepedia" height="40" src={logo} width="40" />
            <Section>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                Hi {username},
              </Text>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                Someone recently requested a password reset for your Grepedia
                account. If this was you, you can set a new password using the
                link below:
              </Text>
              <Button
                className="block w-52.5 rounded bg-[#0085c8] px-1.75 py-3.5 text-center text-[15px] text-white no-underline"
                href={resetLink}
              >
                Reset Password
              </Button>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                If you didn&apos;t request a password reset, you can safely
                ignore and delete this email.
              </Text>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                To keep your account secure, please don&apos;t forward this
                email to anyone.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ResetPasswordEmail.PreviewProps = {
  logo: "http://localhost:3000/favicon-96x96.png",
  resetLink: "http://localhost:3000/reset-password",
  username: "alanturing",
} as ResetPasswordEmailProps;
