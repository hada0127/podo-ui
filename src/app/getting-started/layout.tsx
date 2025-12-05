import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Getting Started',
  description: 'Podo UI 시작하기 - 설치 방법과 기본 사용법을 안내합니다. npm, yarn을 통한 설치와 React, SCSS 프로젝트 설정 방법을 제공합니다.',
  keywords: ['Podo UI 설치', 'Getting Started', 'Installation', 'React Setup', 'SCSS Setup'],
  openGraph: {
    title: 'Getting Started | Podo UI',
    description: 'Podo UI 시작하기 - 설치 방법과 기본 사용법을 안내합니다.',
  },
};

export default function GettingStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
