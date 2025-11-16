import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface ProgramReminderEmailProps {
  customerName: string;
  productName: string;
  daysIntoProgram: number;
  downloadUrl: string;
  motivationalMessage: string;
}

export const ProgramReminderEmail = ({
  customerName,
  productName,
  daysIntoProgram,
  downloadUrl,
  motivationalMessage,
}: ProgramReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Day {daysIntoProgram.toString()} - Keep pushing forward!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're Doing Great! 💪</Heading>
        
        <Text style={text}>Hi {customerName},</Text>
        
        <Text style={text}>
          You're now <strong>{daysIntoProgram} days</strong> into your <strong>{productName}</strong> journey!
        </Text>

        <Section style={motivationalBox}>
          <Text style={motivationalText}>
            {motivationalMessage}
          </Text>
        </Section>

        <Text style={text}>
          Remember, consistency is key. Every workout brings you closer to your goals.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={downloadUrl}>
            Access Your Program
          </Button>
        </Section>

        <Text style={text}>
          Keep up the excellent work, and remember we're here to support you!
        </Text>

        <Text style={footer}>
          Stay strong,
          <br />
          The Transformation Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ProgramReminderEmail;

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

const motivationalBox = {
  backgroundColor: '#f0f7ff',
  borderLeft: '4px solid #5469d4',
  padding: '16px',
  margin: '24px 48px',
};

const motivationalText = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '500',
  lineHeight: '28px',
  margin: '0',
  fontStyle: 'italic',
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

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
  marginTop: '32px',
};
