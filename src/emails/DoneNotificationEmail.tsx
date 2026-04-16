import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Link,
  Preview,
} from '@react-email/components';

interface DoneNotificationEmailProps {
  organiserName: string;
  attendeeName: string;
  itemDescription: string;
  meetingTitle: string;
  doneAt: string;
  meetingId: string;
  appUrl: string;
}

export default function DoneNotificationEmail({
  organiserName,
  attendeeName,
  itemDescription,
  meetingTitle,
  doneAt,
  meetingId,
  appUrl,
}: DoneNotificationEmailProps) {
  const previewText = `${attendeeName} marked an action item as done in ${meetingTitle}`;
  const meetingUrl = `${appUrl}/dashboard/${meetingId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>ActaFlow</Heading>
            <Text style={headerSubtitle}>Action Item Completed</Text>
          </Section>

          {/* Meeting title banner */}
          <Section style={meetingBanner}>
            <Text style={meetingBannerTitle}>{meetingTitle}</Text>
          </Section>

          {/* Content */}
          <Section style={section}>
            <Heading style={h2}>Hi {organiserName},</Heading>
            <Text style={bodyText}>
              Good news — <strong>{attendeeName}</strong> has marked an action item as done.
            </Text>
          </Section>

          {/* Completed item card */}
          <Section style={{ padding: '0 32px 24px' }}>
            <Section style={completedCard}>
              <Text style={checkmark}>✓</Text>
              <Text style={itemText}>{itemDescription}</Text>
              <Text style={metaText}>
                Completed by <strong>{attendeeName}</strong> · {doneAt}
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={section}>
            <Text style={bodyText}>
              View the full meeting to see all action item statuses.
            </Text>
            <Link href={meetingUrl} style={viewButton}>
              View Meeting
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Sent by <strong>ActaFlow</strong> · Turn meetings into action.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ── Styles ── */
const body: React.CSSProperties = {
  backgroundColor: '#f0ede8',
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: '32px 0',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  maxWidth: '600px',
  margin: '0 auto',
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(124, 58, 237, 0.08)',
};

const header: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
  padding: '28px 32px 20px',
  textAlign: 'center' as const,
};

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '800',
  margin: '0 0 4px',
  letterSpacing: '-0.5px',
};

const headerSubtitle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.75)',
  fontSize: '13px',
  margin: 0,
};

const meetingBanner: React.CSSProperties = {
  backgroundColor: '#faf5ff',
  borderBottom: '1px solid #e9d5ff',
  padding: '16px 32px',
  textAlign: 'center' as const,
};

const meetingBannerTitle: React.CSSProperties = {
  color: '#4c1d95',
  fontSize: '16px',
  fontWeight: '700',
  margin: 0,
};

const section: React.CSSProperties = {
  padding: '24px 32px',
};

const h2: React.CSSProperties = {
  color: '#1e1b2e',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const bodyText: React.CSSProperties = {
  color: '#4b4869',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const completedCard: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  borderLeft: '3px solid #16a34a',
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
};

const checkmark: React.CSSProperties = {
  color: '#16a34a',
  fontSize: '20px',
  fontWeight: '800',
  margin: '0 0 6px',
};

const itemText: React.CSSProperties = {
  color: '#1e1b2e',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
  lineHeight: '1.4',
};

const metaText: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '13px',
  margin: 0,
};

const viewButton: React.CSSProperties = {
  backgroundColor: '#7c3aed',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '13px',
  fontWeight: '600',
  padding: '10px 24px',
  textDecoration: 'none',
};

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0 32px',
};

const footer: React.CSSProperties = {
  backgroundColor: '#fafaf8',
  padding: '20px 32px',
  textAlign: 'center' as const,
};

const footerText: React.CSSProperties = {
  color: '#6b6880',
  fontSize: '13px',
  margin: 0,
};
