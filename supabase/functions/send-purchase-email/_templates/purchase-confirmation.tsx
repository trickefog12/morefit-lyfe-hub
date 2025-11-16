import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface PurchaseConfirmationEmailProps {
  customerName: string;
  productName: string;
  amountPaid: number;
  downloadToken: string;
  downloadUrl: string;
}

export const PurchaseConfirmationEmail = ({
  customerName,
  productName,
  amountPaid,
  downloadToken,
  downloadUrl,
}: PurchaseConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your purchase of {productName} is confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank You for Your Purchase!</Heading>
        
        <Text style={text}>Hi {customerName},</Text>
        
        <Text style={text}>
          Your purchase of <strong>{productName}</strong> for €{amountPaid.toFixed(2)} has been confirmed.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={downloadUrl}>
            Download Your Program
          </Button>
        </Section>

        <Text style={text}>
          Or use this secure download link:
        </Text>
        
        <Link href={downloadUrl} style={link}>
          {downloadUrl}
        </Link>

        <Text style={text}>
          Your download token: <code style={code}>{downloadToken}</code>
        </Text>

        <Text style={text}>
          This link is unique to your purchase and will remain valid for your records.
        </Text>

        <Text style={text}>
          If you have any questions, feel free to reach out to us.
        </Text>

        <Text style={footer}>
          Best regards,
          <br />
          The Transformation Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PurchaseConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 48px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
  margin: '16px 0',
};

const buttonContainer = {
  padding: '27px 48px',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const link = {
  color: '#5469d4',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  padding: '0 48px',
};

const code = {
  backgroundColor: '#f4f4f4',
  borderRadius: '4px',
  color: '#333',
  fontSize: '14px',
  padding: '4px 8px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
  marginTop: '32px',
};
