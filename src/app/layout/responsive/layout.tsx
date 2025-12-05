import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Responsive',
  description: 'Podo UI 반응형 유틸리티 - 다양한 화면 크기에 대응하는 반응형 클래스를 제공합니다. Mobile-first 접근 방식을 사용합니다.',
  keywords: ['Responsive Design', 'Breakpoints', 'Mobile First', 'Media Queries', 'Responsive Utilities'],
  openGraph: {
    title: 'Responsive | Podo UI',
    description: 'Podo UI 반응형 유틸리티 - 다양한 화면 크기에 대응하는 반응형 클래스를 제공합니다.',
  },
};

export default function ResponsiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
