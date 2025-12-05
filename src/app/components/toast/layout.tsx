import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Toast',
  description: 'Podo UI Toast 컴포넌트 - 알림 토스트 메시지를 제공합니다. Success, Error, Warning, Info 등 다양한 타입을 지원합니다.',
  keywords: ['React Toast', 'Toast Component', 'Notification', 'Alert', 'Snackbar', 'Podo UI Toast'],
  openGraph: {
    title: 'Toast | Podo UI',
    description: 'Podo UI Toast 컴포넌트 - 알림 토스트 메시지를 제공합니다.',
  },
};

export default function ToastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
