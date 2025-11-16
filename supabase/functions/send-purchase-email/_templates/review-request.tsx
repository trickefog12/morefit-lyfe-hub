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

interface ReviewRequestEmailProps {
  customerName: string;
  productName: string;
  reviewUrl: string;
}

export const ReviewRequestEmail = ({
  customerName,
  productName,
  reviewUrl,
}: ReviewRequestEmailProps) => (
  <Html>
    <Head />
    <Preview>How was your experience with {productName}?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>How's Your Transformation Going?</Heading>
        
        <Text style={text}>Hi {customerName},</Text>
        
        <Text style={text}>
          We hope you're enjoying <strong>{productName}</strong> and making great progress!
        </Text>

        <Text style={text}>
          Your feedback is incredibly valuable to us and helps others in their fitness journey. 
          Would you mind taking a moment to share your experience?
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={reviewUrl}>
            Leave a Review
          </Button>
        </Section>

        <Text style={text}>
          Thank you for being part of our community!
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

export default ReviewRequestEmail;

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

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
  marginTop: '32px',
};
