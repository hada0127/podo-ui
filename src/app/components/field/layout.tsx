import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Field',
  description: 'Podo UI Field 컴포넌트 - 폼 필드 레이아웃을 제공합니다. 라벨, 입력, 헬퍼 텍스트를 포함한 완전한 폼 필드 구조를 지원합니다.',
  keywords: ['React Field', 'Form Field', 'Field Component', 'Form Layout', 'Podo UI Field'],
  openGraph: {
    title: 'Field | Podo UI',
    description: 'Podo UI Field 컴포넌트 - 폼 필드 레이아웃을 제공합니다.',
  },
};

export default function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
