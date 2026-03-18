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

interface DeleteAccountVerificationEmailProps {
  logo: string;
  username: string;
  verificationLink: string;
}

export default function DeleteAccountVerificationEmail({
  logo,
  username,
  verificationLink,
}: DeleteAccountVerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="bg-[#f4f4f5] py-2.5">
          <Preview>Grepedia - verify account deletion</Preview>
          <Container className="border border-solid border-[#e4e4e7] bg-white p-11.25">
            <Img alt="Grepedia" height="40" src={logo} width="40" />
            <Section>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                Hi {username},
              </Text>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                We received a request to permanently delete your Grepedia
                account. If this was you, confirm below:
              </Text>
              <Button
                className="block w-52.5 rounded bg-[#0085c8] px-1.75 py-3.5 text-center text-[15px] text-white no-underline"
                href={verificationLink}
              >
                Verify Account Deletion
              </Button>
              <Text className="text-base leading-6.5 font-light text-[#404040]">
                If you did not request account deletion, ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

DeleteAccountVerificationEmail.PreviewProps = {
  logo: "http://localhost:3000/favicon-96x96.png",
  username: "alanturing",
  verificationLink: "http://localhost:3000/verify-delete-account",
} as DeleteAccountVerificationEmailProps;
