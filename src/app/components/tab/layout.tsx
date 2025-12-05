import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tab',
  description: 'Podo UI Tab 컴포넌트 - 탭 네비게이션을 제공합니다. 가로/세로 레이아웃, 다양한 스타일을 지원합니다.',
  keywords: ['React Tab', 'Tab Component', 'Tab Navigation', 'Tabs', 'Podo UI Tab'],
  openGraph: {
    title: 'Tab | Podo UI',
    description: 'Podo UI Tab 컴포넌트 - 탭 네비게이션을 제공합니다.',
  },
};

export default function TabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
