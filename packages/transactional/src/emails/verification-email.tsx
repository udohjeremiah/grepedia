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

interface VerificationEmailProps {
  fullName: string;
  logo: string;
  verificationLink: string;
}

export function VerificationEmail({
  fullName,
  logo,
  verificationLink,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="bg-[#f4f4f5] py-2.5">
          <Preview>Grepedia — verify your email</Preview>
          <Container className="border border-solid border-[#e4e4e7] bg-white p-11.25">
            <Img alt="Grepedia" height="40" src={logo} width="40" />
            <Section>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                Hi {fullName},
              </Text>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                Someone recently created an account on Grepedia using your email
                address. If this was you, you can verify your email address
                below:
              </Text>
              <Button
                className="block w-52.5 rounded bg-[#0085c8] px-1.75 py-3.5 text-center text-[15px] text-white no-underline"
                href={verificationLink}
              >
                Verify Email
              </Button>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                If you didn&apos;t request this or don&apos;t want to create an
                account, you can safely ignore and delete this email.
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

VerificationEmail.PreviewProps = {
  fullName: "Alan Turing",
  logo: "http://localhost:3000/favicon-96x96.png",
  verificationLink: "http://localhost:3000/verify-email",
} as VerificationEmailProps;
