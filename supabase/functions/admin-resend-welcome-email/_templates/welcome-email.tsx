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

interface WelcomeEmailProps {
  customerName: string;
  programsUrl: string;
}

export const WelcomeEmail = ({
  customerName,
  programsUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MoreFitLyfe - Your fitness journey starts now!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to MoreFitLyfe! 🎉</Heading>
        
        <Text style={text}>Hi {customerName || 'there'},</Text>
        
        <Text style={text}>
          Thank you for verifying your email and joining the MoreFitLyfe community! 
          We're excited to have you on board.
        </Text>

        <Text style={text}>
          You're now ready to explore our professional strength training and transformation 
          programs designed for real results.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={programsUrl}>
            Browse Our Programs
          </Button>
        </Section>

        <Text style={text}>
          <strong>What you can do now:</strong>
        </Text>
        
        <Text style={listText}>• Browse our training programs</Text>
        <Text style={listText}>• Check out our meal plans</Text>
        <Text style={listText}>• Start your transformation journey</Text>

        <Text style={text}>
          If you have any questions, feel free to reach out to us at{' '}
          <Link href="mailto:morefitlyfe@gmail.com" style={link}>
            morefitlyfe@gmail.com
          </Link>
        </Text>

        <Text style={footer}>
          Let's get stronger together!
          <br />
          <br />
          Best regards,
          <br />
          Stefania & The MoreFitLyfe Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

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
  color: '#FF6B35',
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

const listText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 48px 0 64px',
  margin: '4px 0',
};

const buttonContainer = {
  padding: '27px 48px',
};

const button = {
  backgroundColor: '#FF6B35',
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
  color: '#FF6B35',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
  marginTop: '32px',
};
