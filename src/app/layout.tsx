import '../../global.scss';
import '../styles/custom.scss';
import '../styles/font-family.scss'; // custom path
import '../styles/icon.scss'; // custom path

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
