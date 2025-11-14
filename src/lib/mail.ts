import { Resend } from 'resend';

import { env } from '@/lib/env';

export const mail = new Resend(env.RESEND_API_KEY);
