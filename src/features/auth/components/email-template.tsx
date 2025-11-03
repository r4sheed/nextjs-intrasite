import * as React from 'react';

interface EmailTemplateProps {
  companyName: string;
  supportEmail: string;
  children: React.ReactNode;
}

export function EmailTemplate({
  companyName,
  supportEmail,
  children,
}: EmailTemplateProps) {
  const primaryColor = '#1e293b';
  const accentColor = '#6366f1';
  const borderColor = '#e5e7eb';
  const mutedTextColor = '#6b7280';

  return (
    <div
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        lineHeight: 1.5,
        color: primaryColor,
        maxWidth: '560px',
        margin: '20px auto',
        padding: '32px',
        border: `1px solid ${borderColor}`,
        borderRadius: '0.5rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: 'left',
          paddingBottom: '24px',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <h1
          style={{
            color: primaryColor,
            margin: 0,
            fontSize: '24px',
            fontWeight: 700,
          }}
        >
          {companyName}
        </h1>
      </div>

      {/* Dynamic body content */}
      <div style={{ padding: '32px 0' }}>{children}</div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'left',
          paddingTop: '24px',
          borderTop: `1px solid ${borderColor}`,
          fontSize: '13px',
          color: mutedTextColor,
        }}
      >
        <p style={{ margin: '0 0 8px 0' }}>
          If you run into any issues, you can contact our support team at{' '}
          <a
            href={`mailto:${supportEmail}`}
            style={{ color: accentColor, textDecoration: 'none' }}
          >
            {supportEmail}
          </a>
          .
        </p>
      </div>

      {/* Copyright */}
      <div
        style={{
          textAlign: 'center',
          paddingTop: '16px',
          fontSize: '12px',
          color: '#9ca3af',
        }}
      >
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
        </p>
      </div>
    </div>
  );
}

