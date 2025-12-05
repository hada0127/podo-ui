import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editor',
  description: 'Podo UI Editor 컴포넌트 - 리치 텍스트 에디터를 제공합니다. 텍스트 서식, 이미지 삽입 등 다양한 편집 기능을 지원합니다.',
  keywords: ['React Editor', 'Rich Text Editor', 'WYSIWYG', 'Text Editor', 'Podo UI Editor'],
  openGraph: {
    title: 'Editor | Podo UI',
    description: 'Podo UI Editor 컴포넌트 - 리치 텍스트 에디터를 제공합니다.',
  },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
