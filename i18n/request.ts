import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];

async function loadMessages(locale: Locale) {
  const common = (await import(`./locales/${locale}/common.json`)).default;
  const navigation = (await import(`./locales/${locale}/navigation.json`)).default;
  const home = (await import(`./locales/${locale}/home.json`)).default;

  // Getting Started
  const installation = (await import(`./locales/${locale}/installation.json`)).default;
  const usage = (await import(`./locales/${locale}/usage.json`)).default;

  // Foundation
  const colors = (await import(`./locales/${locale}/colors.json`)).default;
  const typography = (await import(`./locales/${locale}/typography.json`)).default;
  const icons = (await import(`./locales/${locale}/icons.json`)).default;
  const spacing = (await import(`./locales/${locale}/spacing.json`)).default;

  // Layout
  const grid = (await import(`./locales/${locale}/grid.json`)).default;
  const responsive = (await import(`./locales/${locale}/responsive.json`)).default;

  // Components
  const avatar = (await import(`./locales/${locale}/avatar.json`)).default;
  const button = (await import(`./locales/${locale}/button.json`)).default;
  const input = (await import(`./locales/${locale}/input.json`)).default;
  const textarea = (await import(`./locales/${locale}/textarea.json`)).default;
  const select = (await import(`./locales/${locale}/select.json`)).default;
  const checkboxRadio = (await import(`./locales/${locale}/checkbox-radio.json`)).default;
  const toggle = (await import(`./locales/${locale}/toggle.json`)).default;
  const file = (await import(`./locales/${locale}/file.json`)).default;
  const editor = (await import(`./locales/${locale}/editor.json`)).default;
  const chip = (await import(`./locales/${locale}/chip.json`)).default;
  const field = (await import(`./locales/${locale}/field.json`)).default;
  const table = (await import(`./locales/${locale}/table.json`)).default;
  const tab = (await import(`./locales/${locale}/tab.json`)).default;
  const pagination = (await import(`./locales/${locale}/pagination.json`)).default;
  const toast = (await import(`./locales/${locale}/toast.json`)).default;
  const tooltip = (await import(`./locales/${locale}/tooltip.json`)).default;

  // Utilities
  const border = (await import(`./locales/${locale}/border.json`)).default;
  const radius = (await import(`./locales/${locale}/radius.json`)).default;
  const elevation = (await import(`./locales/${locale}/elevation.json`)).default;
  const display = (await import(`./locales/${locale}/display.json`)).default;

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
    tooltip,
    border,
    radius,
    elevation,
    display,
  };
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value || 'en') as Locale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
