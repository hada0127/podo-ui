import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utilities',
  description: 'Podo UI 유틸리티 클래스 - 테두리, 둥글기, 그림자, 디스플레이 등 다양한 유틸리티 클래스를 제공합니다.',
  keywords: ['Utility Classes', 'CSS Utilities', 'Border', 'Radius', 'Shadow', 'Display'],
  openGraph: {
    title: 'Utilities | Podo UI',
    description: 'Podo UI 유틸리티 클래스 - 다양한 유틸리티 클래스를 제공합니다.',
  },
};

export default function UtilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
