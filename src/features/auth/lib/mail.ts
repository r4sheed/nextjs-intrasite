import { ResetTemplate } from '@/features/auth/components/reset-template';
import { VerificationTemplate } from '@/features/auth/components/verification-template';
import { mail } from '@/lib/mail';
import { ROUTES } from '@/lib/navigation';

const BASE_URL = 'http://localhost:3000';
const DEFAULT_FROM = 'onboarding@resend.dev';
const BASE_TEMPLATE_PROPS = {
  companyName: 'Your App Name',
  supportEmail: 'support@yourdomain.com',
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${BASE_URL}/${ROUTES.AUTH.VERIFY_EMAIL}?token=${token}`;

  const templateProps = {
    ...BASE_TEMPLATE_PROPS,
    url: url,
  };

  const { data, error } = await mail.emails.send({
    from: DEFAULT_FROM,
    to: email,
    subject: 'Confirm your email address',
    react: VerificationTemplate(templateProps),
  });

  if (error) {
    return console.error('Error sending verification email:', error);
  }

  return data;
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const url = `${BASE_URL}/${ROUTES.AUTH.VERIFY_EMAIL}?token=${token}`;

  const templateProps = {
    ...BASE_TEMPLATE_PROPS,
    url: url,
  };

  const { data, error } = await mail.emails.send({
    from: DEFAULT_FROM,
    to: email,
    subject: 'Reset your password',
    react: ResetTemplate(templateProps),
  });

  if (error) {
    return console.error('Error sending reset password email:', error);
  }

  return data;
};
