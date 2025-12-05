import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Layout',
  description: 'Podo UI 레이아웃 시스템 - 그리드, 반응형 유틸리티를 제공합니다. 12컬럼 그리드와 브레이크포인트 시스템을 사용합니다.',
  keywords: ['Layout System', 'Grid', 'Responsive', 'Flexbox', 'CSS Grid', 'Breakpoints'],
  openGraph: {
    title: 'Layout | Podo UI',
    description: 'Podo UI 레이아웃 시스템 - 그리드와 반응형 유틸리티를 제공합니다.',
  },
};

export default function LayoutPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
