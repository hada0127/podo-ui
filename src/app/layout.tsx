import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import '../../global.scss';
import '../styles/custom.scss';
import '../styles/font-family.scss'; // custom path
import '../styles/icon.scss'; // custom path
import Navigation from '../components/Navigation';
import styles from './layout.module.scss';

export const runtime = 'edge';

export const metadata = {
  title: 'Podo UI - Modern SCSS Module Design System',
  description: 'A modern UI component library for React and SCSS',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <div className={styles.container}>
            <Navigation />
            <main className={styles.main}>{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
