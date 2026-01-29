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
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface ModerationAlertEmailProps {
  blockedContent: string;
  reason: string;
  userEmail: string;
  timestamp: string;
  appUrl: string;
}

export const ModerationAlertEmail = ({
  blockedContent,
  reason,
  userEmail,
  timestamp,
  appUrl,
}: ModerationAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>Review Blocked: Content moderation alert</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>⚠️ Review Blocked by Moderation</Heading>
        
        <Section style={section}>
          <Text style={text}>
            A user attempted to submit a review that was blocked by the automatic content filter.
          </Text>
          <Text style={text}>
            Please review this case to ensure the filter is working correctly.
          </Text>
        </Section>

        <Section style={detailsBox}>
          <Text style={detailsLabel}>User:</Text>
          <Text style={detailsValue}>{userEmail}</Text>
          
          <Text style={detailsLabel}>Block Reason:</Text>
          <Text style={detailsValue}>
            {reason === 'inappropriate_language' ? 'Inappropriate Language Detected' : 
             reason === 'spam_pattern' ? 'Spam Pattern Detected' : reason}
          </Text>
          
          <Text style={detailsLabel}>Blocked Content:</Text>
          <Text style={blockedContentStyle}>{blockedContent}</Text>
          
          <Text style={detailsLabel}>Time:</Text>
          <Text style={detailsValue}>{timestamp}</Text>
        </Section>

        <Section style={section}>
          <Text style={noteText}>
            <strong>Note:</strong> If this content was wrongly blocked, consider updating the moderation filter to allow similar legitimate reviews.
          </Text>
        </Section>

        <Section style={section}>
          <Link
            href={`${appUrl}/admin-dashboard?tab=reviews`}
            target="_blank"
            style={button}
          >
            View Review Management
          </Link>
        </Section>

        <Text style={footer}>
          This is an automated alert from the content moderation system.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ModerationAlertEmail;

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
};

const section = {
  padding: '0 48px',
};

const h1 = {
  color: '#dc2626',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 48px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
};

const noteText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '24px',
  padding: '16px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #fcd34d',
};

const detailsBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 48px',
  border: '1px solid #fecaca',
};

const detailsLabel = {
  color: '#666',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
  marginTop: '16px',
};

const detailsValue = {
  color: '#333',
  fontSize: '16px',
  marginTop: '0',
  marginBottom: '0',
};

const blockedContentStyle = {
  color: '#991b1b',
  fontSize: '14px',
  marginTop: '0',
  marginBottom: '0',
  fontFamily: 'monospace',
  backgroundColor: '#fff',
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid #fecaca',
  wordBreak: 'break-word' as const,
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 48px',
  marginTop: '32px',
};
