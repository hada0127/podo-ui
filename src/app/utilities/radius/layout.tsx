import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Radius',
  description: 'Podo UI Radius 유틸리티 - 모서리 둥글기를 설정하는 유틸리티 클래스를 제공합니다. 다양한 사이즈의 border-radius를 지원합니다.',
  keywords: ['Border Radius', 'Radius Utility', 'Rounded Corners', 'CSS Radius'],
  openGraph: {
    title: 'Radius | Podo UI',
    description: 'Podo UI Radius 유틸리티 - 모서리 둥글기를 설정하는 유틸리티 클래스를 제공합니다.',
  },
};

export default function RadiusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
