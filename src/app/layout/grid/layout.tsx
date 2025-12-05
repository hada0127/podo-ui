import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grid',
  description: 'Podo UI 그리드 시스템 - 12컬럼 기반의 반응형 그리드를 제공합니다. Flexbox 기반으로 유연한 레이아웃을 구성할 수 있습니다.',
  keywords: ['Grid System', '12 Column Grid', 'Responsive Grid', 'Flexbox Grid', 'CSS Grid'],
  openGraph: {
    title: 'Grid | Podo UI',
    description: 'Podo UI 그리드 시스템 - 12컬럼 기반의 반응형 그리드를 제공합니다.',
  },
};

export default function GridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
