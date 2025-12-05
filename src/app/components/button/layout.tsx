import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Button',
  description: 'Podo UI Button 컴포넌트 - Primary, Success, Danger 등 다양한 스타일과 사이즈의 버튼을 제공합니다. Solid, Fill, Border, Text 스타일 지원.',
  keywords: ['React Button', 'Button Component', 'UI Button', 'Podo UI Button'],
  openGraph: {
    title: 'Button | Podo UI',
    description: 'Podo UI Button 컴포넌트 - 다양한 스타일과 사이즈의 버튼을 제공합니다.',
  },
};

export default function ButtonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
