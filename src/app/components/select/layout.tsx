import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Select',
  description: 'Podo UI Select 컴포넌트 - 드롭다운 선택 필드를 제공합니다. 다양한 사이즈와 상태 스타일을 지원합니다.',
  keywords: ['React Select', 'Select Component', 'Dropdown', 'Form Select', 'Podo UI Select'],
  openGraph: {
    title: 'Select | Podo UI',
    description: 'Podo UI Select 컴포넌트 - 드롭다운 선택 필드를 제공합니다.',
  },
};

export default function SelectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
