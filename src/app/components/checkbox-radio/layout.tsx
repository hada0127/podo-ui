import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkbox & Radio',
  description: 'Podo UI Checkbox와 Radio 컴포넌트 - 체크박스와 라디오 버튼을 제공합니다. 다양한 색상과 스타일을 지원합니다.',
  keywords: ['React Checkbox', 'React Radio', 'Checkbox Component', 'Radio Button', 'Form Controls', 'Podo UI'],
  openGraph: {
    title: 'Checkbox & Radio | Podo UI',
    description: 'Podo UI Checkbox와 Radio 컴포넌트 - 체크박스와 라디오 버튼을 제공합니다.',
  },
};

export default function CheckboxRadioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
