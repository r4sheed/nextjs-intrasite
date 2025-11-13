import { Resend } from 'resend';

export const mail = new Resend(process.env.RESEND_API_KEY);
