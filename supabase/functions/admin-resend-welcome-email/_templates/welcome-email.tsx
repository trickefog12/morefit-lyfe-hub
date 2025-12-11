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
  heading?: string;
  greetingPrefix?: string;
  introText?: string;
  bodyText?: string;
  ctaButtonText?: string;
  featuresHeading?: string;
  feature1?: string;
  feature2?: string;
  feature3?: string;
  footerText?: string;
  signature?: string;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const WelcomeEmail = ({
  customerName,
  programsUrl,
  heading = 'Welcome to MoreFitLyfe! 🎉',
  greetingPrefix = 'Hi',
  introText = "Thank you for verifying your email and joining the MoreFitLyfe community! We're excited to have you on board.",
  bodyText = "You're now ready to explore our professional strength training and transformation programs designed for real results.",
  ctaButtonText = 'Browse Our Programs',
  featuresHeading = 'What you can do now:',
  feature1 = 'Browse our training programs',
  feature2 = 'Check out our meal plans',
  feature3 = 'Start your transformation journey',
  footerText = "Let's get stronger together!",
  signature = 'Stefania & The MoreFitLyfe Team',
  primaryColor = '#FF6B35',
  backgroundColor = '#f6f9fc',
  textColor = '#333333',
}: WelcomeEmailProps) => {
  const main = {
    backgroundColor: backgroundColor,
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
    color: primaryColor,
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0 48px',
  };

  const text = {
    color: textColor,
    fontSize: '16px',
    lineHeight: '26px',
    padding: '0 48px',
    margin: '16px 0',
  };

  const listText = {
    color: textColor,
    fontSize: '16px',
    lineHeight: '24px',
    padding: '0 48px 0 64px',
    margin: '4px 0',
  };

  const buttonContainer = {
    padding: '27px 48px',
  };

  const button = {
    backgroundColor: primaryColor,
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
    color: primaryColor,
    textDecoration: 'underline',
  };

  const footer = {
    color: '#8898aa',
    fontSize: '14px',
    lineHeight: '24px',
    padding: '0 48px',
    marginTop: '32px',
  };

  return (
    <Html>
      <Head />
      <Preview>Welcome to MoreFitLyfe - Your fitness journey starts now!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{heading}</Heading>
          
          <Text style={text}>{greetingPrefix} {customerName || 'there'},</Text>
          
          <Text style={text}>{introText}</Text>

          <Text style={text}>{bodyText}</Text>

          <Section style={buttonContainer}>
            <Button style={button} href={programsUrl}>
              {ctaButtonText}
            </Button>
          </Section>

          <Text style={text}>
            <strong>{featuresHeading}</strong>
          </Text>
          
          <Text style={listText}>• {feature1}</Text>
          <Text style={listText}>• {feature2}</Text>
          <Text style={listText}>• {feature3}</Text>

          <Text style={text}>
            If you have any questions, feel free to reach out to us at{' '}
            <Link href="mailto:morefitlyfe@gmail.com" style={link}>
              morefitlyfe@gmail.com
            </Link>
          </Text>

          <Text style={footer}>
            {footerText}
            <br />
            <br />
            Best regards,
            <br />
            {signature}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
