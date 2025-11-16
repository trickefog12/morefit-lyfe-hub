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

interface AdminNotificationEmailProps {
  adminEmail: string;
  actionType: string;
  actionLabel: string;
  performedBy: string;
  target: string;
  details: string;
  timestamp: string;
  appUrl: string;
}

export const AdminNotificationEmail = ({
  adminEmail,
  actionType,
  actionLabel,
  performedBy,
  target,
  details,
  timestamp,
  appUrl,
}: AdminNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Admin Action: {actionLabel}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Admin Action Notification</Heading>
        
        <Section style={section}>
          <Text style={text}>
            Hello,
          </Text>
          <Text style={text}>
            An administrative action was performed that requires your attention.
          </Text>
        </Section>

        <Section style={detailsBox}>
          <Text style={detailsLabel}>Action:</Text>
          <Text style={detailsValue}>{actionLabel}</Text>
          
          <Text style={detailsLabel}>Performed by:</Text>
          <Text style={detailsValue}>{performedBy}</Text>
          
          <Text style={detailsLabel}>Target:</Text>
          <Text style={detailsValue}>{target}</Text>
          
          {details && (
            <>
              <Text style={detailsLabel}>Details:</Text>
              <Text style={detailsValue}>{details}</Text>
            </>
          )}
          
          <Text style={detailsLabel}>Time:</Text>
          <Text style={detailsValue}>{timestamp}</Text>
        </Section>

        <Section style={section}>
          <Link
            href={`${appUrl}/admin-dashboard?tab=audit`}
            target="_blank"
            style={button}
          >
            View Audit Log
          </Link>
        </Section>

        <Text style={footer}>
          This is an automated notification from your admin panel. To manage your notification preferences, visit the admin dashboard settings.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AdminNotificationEmail;

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
  color: '#333',
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

const detailsBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 48px',
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

const button = {
  backgroundColor: '#0ea5e9',
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
