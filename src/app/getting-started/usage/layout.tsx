import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usage',
  description: 'Podo UI 사용법 가이드 - React 컴포넌트와 SCSS 믹스인 사용 방법을 안내합니다. 기본 예제와 커스터마이징 방법을 제공합니다.',
  keywords: ['Podo UI Usage', 'React Components', 'SCSS Mixins', 'How to Use', 'Code Examples'],
  openGraph: {
    title: 'Usage | Podo UI',
    description: 'Podo UI 사용법 가이드 - 컴포넌트와 SCSS 믹스인 사용 방법을 안내합니다.',
  },
};

export default function UsageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
