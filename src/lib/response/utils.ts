import type { Message } from './types';

export const getMessage = (message: Message | undefined): string | undefined =>
  message?.key;
