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
  Row,
  Column,
} from '@react-email/components';

interface ActionItemEmailProps {
  attendeeName: string;
  meetingTitle: string;
  meetingDate: string | null;
  summary: string;
  decisions: string[];
  actionItems: Array<{
    id: string;
    description: string;
    dueDate: string | null;
    priority: 'high' | 'medium' | 'low';
    context?: string;
    doneToken: string;
  }>;
  appUrl: string;
}

const priorityConfig = {
  high: { label: 'High Priority', color: '#7c3aed', bg: '#f3eeff', border: '#7c3aed' },
  medium: { label: 'Medium Priority', color: '#b45309', bg: '#fffbeb', border: '#fbbf24' },
  low: { label: 'Low Priority', color: '#6b7280', bg: '#f9fafb', border: '#d1d5db' },
};

export default function ActionItemEmail({
  attendeeName,
  meetingTitle,
  meetingDate,
  summary,
  decisions,
  actionItems,
  appUrl,
}: ActionItemEmailProps) {
  const previewText = `Your ${actionItems.length} action item${actionItems.length !== 1 ? 's' : ''} from ${meetingTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>ActaFlow</Heading>
            <Text style={headerSubtitle}>Turn meetings into action</Text>
          </Section>

          {/* Meeting title banner */}
          <Section style={meetingBanner}>
            <Text style={meetingBannerTitle}>{meetingTitle}</Text>
            {meetingDate && (
              <Text style={meetingBannerDate}>{meetingDate}</Text>
            )}
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Heading style={h2}>Hi {attendeeName},</Heading>
            <Text style={bodyText}>
              Here are your action items from <strong>{meetingTitle}</strong>.
              You have <strong>{actionItems.length} task{actionItems.length !== 1 ? 's' : ''}</strong> assigned to you.
            </Text>
          </Section>

          {/* Summary box */}
          {summary && (
            <Section style={summaryBox}>
              <Text style={summaryLabel}>MEETING SUMMARY</Text>
              <Text style={summaryText}>{summary}</Text>
            </Section>
          )}

          {/* Action Items */}
          {actionItems.length > 0 && (
            <Section style={section}>
              <Text style={sectionLabel}>YOUR ACTION ITEMS ({actionItems.length})</Text>

              {actionItems.map((item) => {
                const config = priorityConfig[item.priority];
                const doneUrl = `${appUrl}/api/action-items/${item.id}/done?token=${item.doneToken}`;

                return (
                  <Section
                    key={item.id}
                    style={{
                      ...actionCard,
                      borderLeftColor: config.border,
                      backgroundColor: config.bg,
                    }}
                  >
                    <Row>
                      <Column>
                        <Text style={actionDescription}>{item.description}</Text>
                        {item.context && (
                          <Text style={actionContext}>{item.context}</Text>
                        )}
                        <Row style={{ marginTop: '8px' }}>
                          <Column style={{ width: 'auto', paddingRight: '8px' }}>
                            <Text
                              style={{
                                ...priorityBadge,
                                color: config.color,
                                borderColor: config.border,
                              }}
                            >
                              {config.label}
                            </Text>
                          </Column>
                          {item.dueDate && (
                            <Column style={{ width: 'auto' }}>
                              <Text style={dueDateBadge}>
                                Due: {item.dueDate}
                              </Text>
                            </Column>
                          )}
                        </Row>
                        <Link href={doneUrl} style={doneButton}>
                          Mark as Done
                        </Link>
                      </Column>
                    </Row>
                  </Section>
                );
              })}
            </Section>
          )}

          <Hr style={divider} />

          {/* Decisions */}
          {decisions.length > 0 && (
            <Section style={section}>
              <Text style={sectionLabel}>DECISIONS MADE</Text>
              {decisions.map((decision, i) => (
                <Text key={i} style={decisionItem}>
                  · {decision}
                </Text>
              ))}
            </Section>
          )}

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Sent by <strong>ActaFlow</strong> · Turn meetings into action.
            </Text>
            <Text style={footerSmall}>
              The "Mark as Done" links above require no login. Click them to update your action item status instantly.
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
  margin: '0 0 2px',
};

const meetingBannerDate: React.CSSProperties = {
  color: '#7c3aed',
  fontSize: '13px',
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
  margin: 0,
};

const summaryBox: React.CSSProperties = {
  backgroundColor: '#fafaf8',
  borderLeft: '3px solid #7c3aed',
  margin: '0 32px',
  padding: '16px 20px',
  borderRadius: '0 8px 8px 0',
};

const summaryLabel: React.CSSProperties = {
  color: '#7c3aed',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const summaryText: React.CSSProperties = {
  color: '#4b4869',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: 0,
};

const sectionLabel: React.CSSProperties = {
  color: '#7c3aed',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1.5px',
  margin: '0 0 16px',
};

const actionCard: React.CSSProperties = {
  borderLeft: '3px solid',
  borderRadius: '0 8px 8px 0',
  marginBottom: '12px',
  padding: '16px 20px',
};

const actionDescription: React.CSSProperties = {
  color: '#1e1b2e',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
  lineHeight: '1.4',
};

const actionContext: React.CSSProperties = {
  color: '#6b6880',
  fontSize: '13px',
  margin: '0 0 8px',
  fontStyle: 'italic',
};

const priorityBadge: React.CSSProperties = {
  border: '1px solid',
  borderRadius: '999px',
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: '600',
  margin: 0,
  padding: '2px 10px',
};

const dueDateBadge: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  borderRadius: '999px',
  color: '#374151',
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: '500',
  margin: 0,
  padding: '2px 10px',
};

const doneButton: React.CSSProperties = {
  backgroundColor: '#7c3aed',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '13px',
  fontWeight: '600',
  marginTop: '12px',
  padding: '8px 20px',
  textDecoration: 'none',
};

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0 32px',
};

const decisionItem: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 6px',
};

const footer: React.CSSProperties = {
  backgroundColor: '#fafaf8',
  padding: '20px 32px',
  textAlign: 'center' as const,
};

const footerText: React.CSSProperties = {
  color: '#6b6880',
  fontSize: '13px',
  margin: '0 0 6px',
};

const footerSmall: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '11px',
  margin: 0,
  lineHeight: '1.5',
};
