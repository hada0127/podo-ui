import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'File Upload',
  description: 'Podo UI File Upload 컴포넌트 - 파일 업로드 입력 필드를 제공합니다. 드래그 앤 드롭 및 다중 파일 업로드를 지원합니다.',
  keywords: ['React File Upload', 'File Input', 'Drag and Drop', 'File Component', 'Podo UI File'],
  openGraph: {
    title: 'File Upload | Podo UI',
    description: 'Podo UI File Upload 컴포넌트 - 파일 업로드 입력 필드를 제공합니다.',
  },
};

export default function FileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
