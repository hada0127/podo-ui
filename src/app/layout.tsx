import '../../global.scss';
import '../styles/custom.scss';
import '../styles/font-family.scss'; // custom path
import '../styles/icon.scss'; // custom path
import Navigation from '../components/Navigation';
import styles from './layout.module.scss';

export const runtime = 'edge';

export const metadata = {
  title: 'Podo UI - SCSS Module 기반 디자인 시스템',
  description: 'React와 SCSS를 위한 모던 UI 컴포넌트 라이브러리',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className={styles.container}>
          <Navigation />
          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}
