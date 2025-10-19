import type { AuthError } from './error';

export type AuthResponse = { ok: true } | AuthError;
