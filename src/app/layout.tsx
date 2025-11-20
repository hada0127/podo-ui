import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import { locales, type Locale } from '../../i18n/request';
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

async function loadMessages(locale: Locale) {
  const common = (await import(`../../i18n/locales/${locale}/common.json`)).default;
  const navigation = (await import(`../../i18n/locales/${locale}/navigation.json`)).default;
  const home = (await import(`../../i18n/locales/${locale}/home.json`)).default;

  // Getting Started
  const installation = (await import(`../../i18n/locales/${locale}/installation.json`)).default;
  const usage = (await import(`../../i18n/locales/${locale}/usage.json`)).default;

  // Foundation
  const colors = (await import(`../../i18n/locales/${locale}/colors.json`)).default;
  const typography = (await import(`../../i18n/locales/${locale}/typography.json`)).default;
  const icons = (await import(`../../i18n/locales/${locale}/icons.json`)).default;
  const spacing = (await import(`../../i18n/locales/${locale}/spacing.json`)).default;

  // Layout
  const grid = (await import(`../../i18n/locales/${locale}/grid.json`)).default;
  const responsive = (await import(`../../i18n/locales/${locale}/responsive.json`)).default;

  // Components
  const avatar = (await import(`../../i18n/locales/${locale}/avatar.json`)).default;
  const button = (await import(`../../i18n/locales/${locale}/button.json`)).default;
  const input = (await import(`../../i18n/locales/${locale}/input.json`)).default;
  const textarea = (await import(`../../i18n/locales/${locale}/textarea.json`)).default;
  const select = (await import(`../../i18n/locales/${locale}/select.json`)).default;
  const checkboxRadio = (await import(`../../i18n/locales/${locale}/checkboxRadio.json`)).default;
  const toggle = (await import(`../../i18n/locales/${locale}/toggle.json`)).default;
  const file = (await import(`../../i18n/locales/${locale}/file.json`)).default;
  const editor = (await import(`../../i18n/locales/${locale}/editor.json`)).default;
  const chip = (await import(`../../i18n/locales/${locale}/chip.json`)).default;
  const field = (await import(`../../i18n/locales/${locale}/field.json`)).default;
  const table = (await import(`../../i18n/locales/${locale}/table.json`)).default;
  const tab = (await import(`../../i18n/locales/${locale}/tab.json`)).default;
  const pagination = (await import(`../../i18n/locales/${locale}/pagination.json`)).default;
  const toast = (await import(`../../i18n/locales/${locale}/toast.json`)).default;

  // Utilities
  const border = (await import(`../../i18n/locales/${locale}/border.json`)).default;
  const radius = (await import(`../../i18n/locales/${locale}/radius.json`)).default;
  const elevation = (await import(`../../i18n/locales/${locale}/elevation.json`)).default;
  const display = (await import(`../../i18n/locales/${locale}/display.json`)).default;

  return {
    common,
    navigation,
    home,
    installation,
    usage,
    colors,
    typography,
    icons,
    spacing,
    grid,
    responsive,
    avatar,
    button,
    input,
    textarea,
    select,
    checkboxRadio,
    toggle,
    file,
    editor,
    chip,
    field,
    table,
    tab,
    pagination,
    toast,
    border,
    radius,
    elevation,
    display,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value || 'en') as Locale;
  const messages = await loadMessages(locale);

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
