import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Icons',
  description: 'Podo UI 아이콘 시스템 - 다양한 UI 아이콘을 제공합니다. SVG 기반의 경량 아이콘 폰트를 사용합니다.',
  keywords: ['Icon System', 'UI Icons', 'Icon Font', 'SVG Icons', 'Podo UI Icons'],
  openGraph: {
    title: 'Icons | Podo UI',
    description: 'Podo UI 아이콘 시스템 - 다양한 UI 아이콘을 제공합니다.',
  },
};

export default function IconsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
