import { Resend } from 'resend';

import { env } from '@/lib/env';

export const mail = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
