import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datepicker',
  description: 'Podo UI Datepicker 컴포넌트 - 날짜 선택기를 제공합니다. 단일 날짜, 날짜 범위 선택을 지원합니다.',
  keywords: ['React Datepicker', 'Date Picker', 'Calendar', 'Date Input', 'Podo UI Datepicker'],
  openGraph: {
    title: 'Datepicker | Podo UI',
    description: 'Podo UI Datepicker 컴포넌트 - 날짜 선택기를 제공합니다.',
  },
};

export default function DatepickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
