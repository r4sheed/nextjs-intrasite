import { EmailTemplate } from '@/features/auth/components/email-template';

interface TwoFactorTemplateProps {
  token: string;
  companyName: string;
  supportEmail: string;
  verificationUrl: string;
}

export function TwoFactorTemplate({
  token,
  companyName,
  supportEmail,
  verificationUrl,
}: TwoFactorTemplateProps) {
  const primaryColor = '#1e293b';
  const accentColor = '#6366f1';

  return (
    <EmailTemplate companyName={companyName} supportEmail={supportEmail}>
      <p style={{ fontSize: '16px', margin: '0 0 16px 0', fontWeight: 500 }}>
        Welcome
      </p>

      <p style={{ fontSize: '16px', margin: '0 0 24px 0' }}>
        Here is your two-factor authentication code:
      </p>

      <div
        style={{
          textAlign: 'center',
          margin: '40px 0',
          padding: '24px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: `1px solid ${accentColor}`,
          fontSize: '32px',
          fontWeight: 600,
          letterSpacing: '8px',
          color: primaryColor,
        }}
      >
        {token}
      </div>

      <a
        href={verificationUrl}
        style={{
          display: 'inline-block',
          backgroundColor: accentColor,
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: '16px',
        }}
      >
        Verify automatically
      </a>

      <p style={{ fontSize: '14px', margin: 0, color: '#64748b' }}>
        Clicking the button fills the code on the verification page. If the
        button does not work, copy the code above and paste it into the
        verification form.
      </p>
    </EmailTemplate>
  );
}
