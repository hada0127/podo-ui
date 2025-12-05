import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Components',
  description: 'Podo UI 컴포넌트 목록 - Button, Input, Select, Checkbox, Toggle, Table, Modal 등 다양한 React UI 컴포넌트를 제공합니다.',
  keywords: ['React 컴포넌트', 'UI Components', 'Button', 'Input', 'Select', 'Table', 'Modal'],
  openGraph: {
    title: 'Components | Podo UI',
    description: 'Podo UI 컴포넌트 목록 - 다양한 React UI 컴포넌트를 제공합니다.',
  },
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
