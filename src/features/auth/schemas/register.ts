import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email({ message: 'Email is required' }),
  password: z
    .string({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
  // .refine(value => /[A-Z]/.test(value), {
  //   message: 'Password must contain at least one uppercase letter',
  // })
  // .refine(value => /[a-z]/.test(value), {
  //   message: 'Password must contain at least one lowercase letter',
  // })
  // .refine(value => /[0-9]/.test(value), {
  //   message: 'Password must contain at least one number',
  // })
  // .refine(value => /[!@#$%^&*(),.?":{}|<>]/.test(value), {
  //   message: 'Password must contain at least one special character',
  // }),
  name: z
    .string({ message: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters long' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
