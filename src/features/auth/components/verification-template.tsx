import { EmailTemplate } from '@/features/auth/components/email-template';

interface VerificationTemplateProps {
  url: string;
  companyName: string;
  supportEmail: string;
}

export function VerificationTemplate({
  url,
  companyName,
  supportEmail,
}: VerificationTemplateProps) {
  const primaryColor = '#1e293b';
  const accentColor = '#6366f1';

  return (
    <EmailTemplate companyName={companyName} supportEmail={supportEmail}>
      <p style={{ fontSize: '16px', margin: '0 0 16px 0', fontWeight: 500 }}>
        Welcome
      </p>

      <p style={{ fontSize: '16px', margin: '0 0 24px 0' }}>
        Thank you for joining {companyName}! Please click the button below to
        verify your email.
      </p>

      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <a
          href={url}
          target="_blank"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: primaryColor,
            borderRadius: '0.375rem',
            textDecoration: 'none',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Confirm Your Email
        </a>
      </div>

      <p style={{ fontSize: '13px', color: '#6b7280' }}>
        Trouble clicking the button? Copy and paste this URL into your browser:
      </p>
      <a
        href={url}
        target="_blank"
        style={{
          color: accentColor,
          wordBreak: 'break-all',
          textDecoration: 'underline',
          fontSize: '12px',
        }}
      >
        {url}
      </a>
    </EmailTemplate>
  );
}
