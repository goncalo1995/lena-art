import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import { hasLocale } from 'next-intl';

export default getRequestConfig(async ({requestLocale}) => { 
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  console.log('locale', locale);
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});