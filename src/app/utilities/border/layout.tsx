import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Border',
  description: 'Podo UI Border 유틸리티 - 테두리 스타일, 너비, 색상을 설정하는 유틸리티 클래스를 제공합니다.',
  keywords: ['Border Utility', 'Border Width', 'Border Color', 'Border Style', 'CSS Border'],
  openGraph: {
    title: 'Border | Podo UI',
    description: 'Podo UI Border 유틸리티 - 테두리 스타일을 설정하는 유틸리티 클래스를 제공합니다.',
  },
};

export default function BorderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
