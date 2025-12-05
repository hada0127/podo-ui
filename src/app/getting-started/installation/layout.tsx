import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Installation',
  description: 'Podo UI 설치 가이드 - npm, yarn을 통한 설치 방법과 프로젝트 설정 방법을 안내합니다.',
  keywords: ['npm install podo-ui', 'yarn add podo-ui', 'Podo UI Installation', 'Setup Guide'],
  openGraph: {
    title: 'Installation | Podo UI',
    description: 'Podo UI 설치 가이드 - npm, yarn을 통한 설치 방법을 안내합니다.',
  },
};

export default function InstallationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
