import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pagination',
  description: 'Podo UI Pagination 컴포넌트 - 페이지네이션 UI를 제공합니다. 다양한 스타일과 커스터마이징 옵션을 지원합니다.',
  keywords: ['React Pagination', 'Pagination Component', 'Page Navigation', 'Podo UI Pagination'],
  openGraph: {
    title: 'Pagination | Podo UI',
    description: 'Podo UI Pagination 컴포넌트 - 페이지네이션 UI를 제공합니다.',
  },
};

export default function PaginationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
