import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Table',
  description: 'Podo UI Table 컴포넌트 - 데이터 테이블을 제공합니다. 정렬, 필터링, 페이지네이션 등 다양한 기능을 지원합니다.',
  keywords: ['React Table', 'Table Component', 'Data Table', 'Grid', 'Podo UI Table'],
  openGraph: {
    title: 'Table | Podo UI',
    description: 'Podo UI Table 컴포넌트 - 데이터 테이블을 제공합니다.',
  },
};

export default function TableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
