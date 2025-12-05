import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Input',
  description: 'Podo UI Input 컴포넌트 - 텍스트 입력, 비밀번호, 이메일 등 다양한 타입의 입력 필드를 제공합니다. 유효성 검사 상태 스타일 지원.',
  keywords: ['React Input', 'Input Component', 'Text Field', 'Form Input', 'Podo UI Input'],
  openGraph: {
    title: 'Input | Podo UI',
    description: 'Podo UI Input 컴포넌트 - 다양한 타입의 입력 필드를 제공합니다.',
  },
};

export default function InputLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
