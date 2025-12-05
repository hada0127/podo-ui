import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Foundation',
  description: 'Podo UI Foundation - 디자인 시스템의 기본 요소인 색상, 타이포그래피, 아이콘, 간격 시스템을 제공합니다.',
  keywords: ['Design System', 'Foundation', 'Design Tokens', 'Colors', 'Typography', 'Icons', 'Spacing'],
  openGraph: {
    title: 'Foundation | Podo UI',
    description: 'Podo UI Foundation - 디자인 시스템의 기본 요소를 제공합니다.',
  },
};

export default function FoundationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
