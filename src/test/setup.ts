import { vi } from 'vitest';

const signInMock = vi.fn();
const signOutMock = vi.fn();

vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    auth: vi.fn(),
    handlers: {},
    signIn: signInMock,
    signOut: signOutMock,
  })),
  AuthError: class AuthError extends Error {
    constructor(public type?: string) {
      super(type);
    }
  },
}));
