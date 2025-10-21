import * as React from 'react';

import { email } from 'zod';

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
  const primaryColor = '#1e293b'; // Dark Gray / Near Black
  const accentColor = '#6366f1'; // Indigo for links/accents
  const borderColor = '#e5e7eb'; // Very light gray border
  const mutedTextColor = '#6b7280'; // Muted text color for context

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
      {/* Header/Branding Area */}
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

      {/* Body Content */}
      <div style={{ padding: '32px 0' }}>
        <p style={{ fontSize: '16px', margin: '0 0 16px 0', fontWeight: 500 }}>
          Welcome
        </p>

        <p style={{ fontSize: '16px', margin: '0 0 24px 0' }}>
          Thank you for starting your journey with {companyName}! To fully
          activate your account and start using our services, please click the
          verification button below.
        </p>

        {/* Call to Action Button */}
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

        {/* Support Context */}
        <p style={{ fontSize: '16px', margin: '0', color: primaryColor }}>
          If you run into any issues, you can always contact our support team at{' '}
          <a
            href={`mailto:${supportEmail}`}
            style={{ color: accentColor, textDecoration: 'none' }}
          >
            {supportEmail}
          </a>
          .
        </p>
      </div>

      {/* Footer / Fallback Link */}
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
          Trouble clicking the button? Copy and paste the full verification URL
          into your web browser:
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
      </div>

      {/* Copyright Line */}
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
