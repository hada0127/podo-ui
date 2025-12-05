import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chip',
  description: 'Podo UI Chip 컴포넌트 - 태그, 라벨, 뱃지 스타일의 칩을 제공합니다. 삭제 가능, 클릭 가능한 인터랙티브 칩을 지원합니다.',
  keywords: ['React Chip', 'Chip Component', 'Tag', 'Badge', 'Label', 'Podo UI Chip'],
  openGraph: {
    title: 'Chip | Podo UI',
    description: 'Podo UI Chip 컴포넌트 - 태그, 라벨, 뱃지 스타일의 칩을 제공합니다.',
  },
};

export default function ChipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
