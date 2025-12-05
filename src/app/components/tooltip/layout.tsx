import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tooltip',
  description: 'Podo UI Tooltip 컴포넌트 - 호버 시 표시되는 툴팁을 제공합니다. 다양한 위치와 스타일을 지원합니다.',
  keywords: ['React Tooltip', 'Tooltip Component', 'Hover Tooltip', 'Podo UI Tooltip'],
  openGraph: {
    title: 'Tooltip | Podo UI',
    description: 'Podo UI Tooltip 컴포넌트 - 호버 시 표시되는 툴팁을 제공합니다.',
  },
};

export default function TooltipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
