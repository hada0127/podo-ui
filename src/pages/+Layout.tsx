import { useLayoutEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import Navigation from '@/components/Navigation'
import '@/i18n'
import '../../global.scss'
import '../styles/custom.scss'
import '../styles/font-family.scss'
import '../styles/icon.scss'
import styles from './Layout.module.scss'

// Disable browser's automatic scroll restoration
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { urlPathname } = usePageContext()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }, [urlPathname])

  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
