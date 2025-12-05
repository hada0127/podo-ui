import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Toggle',
  description: 'Podo UI Toggle 컴포넌트 - ON/OFF 토글 스위치를 제공합니다. 다양한 색상과 사이즈를 지원합니다.',
  keywords: ['React Toggle', 'Toggle Switch', 'Switch Component', 'Podo UI Toggle'],
  openGraph: {
    title: 'Toggle | Podo UI',
    description: 'Podo UI Toggle 컴포넌트 - ON/OFF 토글 스위치를 제공합니다.',
  },
};

export default function ToggleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
