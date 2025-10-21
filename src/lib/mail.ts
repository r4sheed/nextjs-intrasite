import { Resend } from 'resend';

import { VerificationTemplate } from '@/features/auth/components/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `https://localhost:3000/verification?token=${token}`;

  const templateProps = {
    url: confirmLink,
    companyName: 'Your App Name',
    supportEmail: 'support@yourdomain.com',
  };

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Confirm your email address',
    react: VerificationTemplate(templateProps),
  });

  if (error) {
    return console.error('Error sending verification email:', error);
  }

  return data;
};
