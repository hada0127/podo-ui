import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Textarea',
  description: 'Podo UI Textarea 컴포넌트 - 여러 줄 텍스트 입력 필드를 제공합니다. 자동 높이 조절 및 다양한 스타일을 지원합니다.',
  keywords: ['React Textarea', 'Textarea Component', 'Multi-line Input', 'Podo UI Textarea'],
  openGraph: {
    title: 'Textarea | Podo UI',
    description: 'Podo UI Textarea 컴포넌트 - 여러 줄 텍스트 입력 필드를 제공합니다.',
  },
};

export default function TextareaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
