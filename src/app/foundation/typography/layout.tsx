import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Typography',
  description: 'Podo UI 타이포그래피 시스템 - 제목, 본문, 캡션 등 텍스트 스타일과 반응형 폰트 사이즈를 제공합니다.',
  keywords: ['Typography', 'Font System', 'Text Styles', 'Heading', 'Body Text', 'SCSS Typography'],
  openGraph: {
    title: 'Typography | Podo UI',
    description: 'Podo UI 타이포그래피 시스템 - 텍스트 스타일과 반응형 폰트 사이즈를 제공합니다.',
  },
};

export default function TypographyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
