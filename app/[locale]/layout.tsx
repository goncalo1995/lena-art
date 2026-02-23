import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import '../globals.css'
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const _inter = Inter({ subsets: ['latin'] })
// const _playfair = Playfair_Display({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Helena Colaço | Artist',
    template: '%s | Helena Colaço',
  },
  description:
    'Portfolio of Helena Colaço - Drawings, Paintings, Photography and Poems.',
}

const locales = ['en', 'pt'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages for this locale
  const messages = await getMessages({ locale });
  
  return (
    <html lang={locale}>
      <body className={`${_inter.className} font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <LanguageSwitcher />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
