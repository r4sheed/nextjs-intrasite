import { EmailTemplate } from '@/features/auth/components/email-template';

interface TwoFactorTemplateProps {
  token: string;
  companyName: string;
  supportEmail: string;
}

export function TwoFactorTemplate({
  token,
  companyName,
  supportEmail,
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

      <div style={{ textAlign: 'center', margin: '40px 0' }}>{token}</div>
    </EmailTemplate>
  );
}
