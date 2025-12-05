import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elevation',
  description: 'Podo UI Elevation 유틸리티 - 그림자 효과를 설정하는 유틸리티 클래스를 제공합니다. 다양한 레벨의 box-shadow를 지원합니다.',
  keywords: ['Elevation', 'Box Shadow', 'Shadow Utility', 'CSS Shadow', 'Drop Shadow'],
  openGraph: {
    title: 'Elevation | Podo UI',
    description: 'Podo UI Elevation 유틸리티 - 그림자 효과를 설정하는 유틸리티 클래스를 제공합니다.',
  },
};

export default function ElevationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
