import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Avatar',
  description: 'Podo UI Avatar 컴포넌트 - 사용자 프로필 이미지, 아이콘, 텍스트 아바타를 제공합니다. 다양한 사이즈와 상태 표시를 지원합니다.',
  keywords: ['React Avatar', 'Avatar Component', 'Profile Image', 'User Avatar', 'Podo UI Avatar'],
  openGraph: {
    title: 'Avatar | Podo UI',
    description: 'Podo UI Avatar 컴포넌트 - 사용자 프로필 아바타를 제공합니다.',
  },
};

export default function AvatarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
