import { getRequestConfig } from 'next-intl/server';

import { defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // In a real app, you'd use the locale from the request
  // For now, we'll use the default locale
  const currentLocale = locale || defaultLocale;

  return {
    timeZone: 'Europe/Budapest',
    locale: currentLocale,
    messages: (await import(`../locales/${currentLocale}.json`)).default,
  };
});
