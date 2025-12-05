import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spacing',
  description: 'Podo UI 간격 시스템 - 일관된 여백과 패딩을 위한 간격 스케일을 제공합니다. 8px 기반의 간격 시스템을 사용합니다.',
  keywords: ['Spacing System', 'Margin', 'Padding', 'Gap', 'Design Tokens', 'SCSS Spacing'],
  openGraph: {
    title: 'Spacing | Podo UI',
    description: 'Podo UI 간격 시스템 - 일관된 여백과 패딩을 위한 간격 스케일을 제공합니다.',
  },
};

export default function SpacingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
