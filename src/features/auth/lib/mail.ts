import { mail } from '@/lib/mail';
import { routes } from '@/lib/navigation';
import { maskEmail } from '@/lib/utils';

import { ResetTemplate } from '@/features/auth/components/reset-template';
import { TwoFactorTemplate } from '@/features/auth/components/two-factor-template';
import { VerificationTemplate } from '@/features/auth/components/verification-template';

const MAIL_BASE_URL = 'http://localhost:3000';
const DEFAULT_FROM = 'onboarding@resend.dev';
const BASE_TEMPLATE_PROPS = {
  companyName: 'Your App Name',
  supportEmail: 'support@yourdomain.com',
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${MAIL_BASE_URL}${routes.auth.verify.url}?type=email&token=${token}`;

  // TEMPORARY: Log to console instead of sending email to avoid daily limit
  console.log('\n========================================');
  console.log('🔐 EMAIL VERIFICATION (DEVELOPMENT MODE)');
  console.log('========================================');
  console.log(`URL:  ${url}`);
  console.log('========================================\n');

  return { success: true };

  /* ORIGINAL CODE - RE-ENABLE IN PRODUCTION
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
  */
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const url = `${MAIL_BASE_URL}${routes.auth.newPassword.url}?token=${token}`;

  // TEMPORARY: Log to console instead of sending email to avoid daily limit
  console.log('\n========================================');
  console.log('🔐 PASSWORD RESET (DEVELOPMENT MODE)');
  console.log('========================================');
  console.log(`URL:  ${url}`);
  console.log('========================================\n');

  return { success: true };

  /* ORIGINAL CODE - RE-ENABLE IN PRODUCTION
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
  */
};

type TwoFactorMailOptions = Readonly<{
  email: string;
  token: string;
  sessionId: string;
}>;

export const sendTwoFactorTokenEmail = async (
  options: TwoFactorMailOptions
) => {
  const maskedEmail = maskEmail(options.email);
  const verificationUrl = `${MAIL_BASE_URL}${routes.auth.verify.url}?type=2fa&sessionId=${encodeURIComponent(
    options.sessionId
  )}&email=${encodeURIComponent(maskedEmail)}&code=${encodeURIComponent(
    options.token
  )}`;

  // TEMPORARY: Log to console instead of sending email to avoid daily limit
  console.log('\n========================================');
  console.log('🔐 TWO-FACTOR CODE (DEVELOPMENT MODE)');
  console.log('========================================');
  console.log(`Email: ${options.email}`);
  console.log(`Code: ${options.token}`);
  console.log(`URL:  ${verificationUrl}`);
  console.log('========================================\n');

  return { success: true };

  /* ORIGINAL CODE - RE-ENABLE IN PRODUCTION
  const templateProps = {
    ...BASE_TEMPLATE_PROPS,
    token: options.token,
    verificationUrl,
  };
  const { data, error } = await mail.emails.send({
    from: DEFAULT_FROM,
    to: options.email,
    subject: 'Two-factor authentication code',
    react: TwoFactorTemplate(templateProps),
  });
  if (error) {
    return console.error('Error sending two-factor code email:', error);
  }
  return data;
  */
};
