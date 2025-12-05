import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Display',
  description: 'Podo UI Display 유틸리티 - 요소의 display 속성을 설정하는 유틸리티 클래스를 제공합니다. flex, grid, block, none 등을 지원합니다.',
  keywords: ['Display Utility', 'Flexbox', 'CSS Grid', 'Block', 'Inline', 'Hidden'],
  openGraph: {
    title: 'Display | Podo UI',
    description: 'Podo UI Display 유틸리티 - display 속성을 설정하는 유틸리티 클래스를 제공합니다.',
  },
};

export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
