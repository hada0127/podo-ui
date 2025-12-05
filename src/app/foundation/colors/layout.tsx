import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Colors',
  description: 'Podo UI 색상 시스템 - Primary, Success, Warning, Danger 등 시맨틱 색상과 다크 모드를 지원하는 색상 팔레트를 제공합니다.',
  keywords: ['Design System Colors', 'Color Palette', 'Color Tokens', 'Dark Mode Colors', 'SCSS Colors'],
  openGraph: {
    title: 'Colors | Podo UI',
    description: 'Podo UI 색상 시스템 - 시맨틱 색상과 다크 모드를 지원합니다.',
  },
};

export default function ColorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
