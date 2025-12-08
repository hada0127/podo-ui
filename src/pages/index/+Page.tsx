import { useTranslation } from 'react-i18next';
import SectionHeader from '@/components/home/SectionHeader';
import BrowserWindow from '@/components/home/BrowserWindow';
import FeatureCard from '@/components/home/FeatureCard';
import Avatar from '../../../react/atom/avatar';
import styles from './Page.module.scss';

export default function Home() {
  const { t } = useTranslation('home');

  const formatText = (text: string) => {
    return text.split('\n').map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <img src="/logo.svg" alt="Podo UI" width={64} height={64} />
          </div>
          <h1 className={styles.heroTitle}>
            {t('hero.greeting')}
            <br />
            <span className={styles.brandName}>{t('hero.brandName')}</span>
          </h1>
          <p className={styles.heroDescription}>
            {formatText(t('hero.description'))}
          </p>
          <div className={styles.heroLinks}>
            <a
              href="https://github.com/hada0127/podo-ui"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
            <a
              href="https://www.npmjs.com/package/podo-ui"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/>
              </svg>
              <span>NPM</span>
            </a>
          </div>
          <div className={styles.heroActions}>
            <a href="/getting-started/installation" className={styles.btnPrimary}>
              {t('hero.getStarted')}
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <SectionHeader
          title={t('features.title')}
          description={t('features.description')}
        />

        {/* Browser Mockup */}
        <div className={styles.browserMockup}>
          <BrowserWindow>
            <div className={styles.browserContent}>
              <div className={styles.mockSidebar}>
                <div className={styles.sidebarItem}>Docs</div>
                <div className={styles.sidebarItem}>Text</div>
                <div className={styles.sidebarItem}>Icon</div>
                <div className={styles.sidebarItem}>Input</div>
                <div className={styles.sidebarItem}>Select</div>
              </div>
              <div className={styles.mockMain}>
                <div className={styles.mockCard}>
                  <div className={styles.mockCardHeader}>Header</div>
                  <div className={styles.mockCardBody}>
                    <div className={styles.mockLine}></div>
                    <div className={styles.mockLine}></div>
                    <div className={styles.mockLine}></div>
                  </div>
                  <div className={styles.mockCardFooter}>
                    <button className="default xs">Cancel</button>
                    <button className="primary xs">Submit</button>
                  </div>
                </div>
                <div className={styles.mockProfile}>
                  <div className={styles.mockAvatar}></div>
                  <div className={styles.mockText}>
                    <div className={styles.mockTextLine}></div>
                    <div className={styles.mockTextLine}></div>
                  </div>
                </div>
              </div>
            </div>
          </BrowserWindow>
        </div>
      </section>

      {/* Feature Cards */}
      <section className={styles.featureCards}>
        <FeatureCard
          icon={
            <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="rocket-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
                <linearGradient id="flame-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f093fb" />
                  <stop offset="100%" stopColor="#f5576c" />
                </linearGradient>
              </defs>
              <path
                d="M32 8L36 20L48 24L36 28L32 40L28 28L16 24L28 20L32 8Z"
                fill="url(#rocket-gradient)"
              />
              <circle cx="32" cy="32" r="20" fill="url(#rocket-gradient)" opacity="0.2" />
              <path
                d="M32 16C32 16 28 24 28 32C28 36 30 38 32 40C34 38 36 36 36 32C36 24 32 16 32 16Z"
                fill="url(#flame-gradient)"
              />
              <circle cx="32" cy="28" r="3" fill="#ffffff" />
            </svg>
          }
          title={t('featureCards.performance.title')}
          description={t('featureCards.performance.description')}
        />
        <FeatureCard
          icon={
            <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="palette-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fa709a" />
                  <stop offset="100%" stopColor="#fee140" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="24" fill="url(#palette-gradient)" opacity="0.2" />
              <path
                d="M32 12C20.96 12 12 20.96 12 32C12 37.52 14.84 42.36 19.08 45.28C20.6 46.24 22.56 45.4 22.56 43.56C22.56 42.68 22.16 41.84 21.52 41.2C18.72 38.4 17 34.44 17 32C17 23.72 23.72 17 32 17C40.28 17 47 23.72 47 32C47 36.4 43.6 40 39 40H35C33.9 40 33 40.9 33 42C33 42.44 33.16 42.84 33.44 43.12C33.84 43.52 34 44.08 34 44.68C34 46.52 32.52 48 30.68 48H30C19.52 48 12 40.48 12 32"
                fill="url(#palette-gradient)"
              />
              <circle cx="24" cy="28" r="3" fill="#667eea" />
              <circle cx="32" cy="24" r="3" fill="#f093fb" />
              <circle cx="40" cy="28" r="3" fill="#4facfe" />
              <circle cx="36" cy="36" r="3" fill="#43e97b" />
            </svg>
          }
          title={t('featureCards.tokens.title')}
          description={t('featureCards.tokens.description')}
        />
        <FeatureCard
          icon={
            <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f6d365" />
                  <stop offset="100%" stopColor="#fda085" />
                </linearGradient>
                <linearGradient id="moon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a8edea" />
                  <stop offset="100%" stopColor="#667eea" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="24" fill="url(#sun-gradient)" opacity="0.2" />
              <circle cx="22" cy="28" r="10" fill="url(#sun-gradient)" />
              <path d="M22 14V18M22 38V42M34 28H38M6 28H10M30 18L32 20M12 38L14 36M30 38L32 36M12 18L14 20" stroke="url(#sun-gradient)" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M46 40C46 40 42 36 38 36C34 36 32 38 32 42C32 46 34 48 38 48C42 48 46 44 46 40Z"
                fill="url(#moon-gradient)"
              />
              <path
                d="M42 44C40 44 38 42 38 40C38 38 40 36 42 36C42.5 36 43 36.1 43.5 36.3C42.6 37.2 42 38.5 42 40C42 41.5 42.6 42.8 43.5 43.7C43 43.9 42.5 44 42 44Z"
                fill="url(#moon-gradient)"
                opacity="0.6"
              />
            </svg>
          }
          title={t('featureCards.darkMode.title')}
          description={t('featureCards.darkMode.description')}
        />
        <FeatureCard
          icon={
            <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="grid-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="100%" stopColor="#00f2fe" />
                </linearGradient>
                <linearGradient id="grid-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#43e97b" />
                  <stop offset="100%" stopColor="#38f9d7" />
                </linearGradient>
                <linearGradient id="grid-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fa709a" />
                  <stop offset="100%" stopColor="#fee140" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="24" fill="url(#grid-gradient-1)" opacity="0.1" />
              <rect x="12" y="16" width="16" height="12" rx="2" fill="url(#grid-gradient-1)" />
              <rect x="32" y="16" width="10" height="12" rx="2" fill="url(#grid-gradient-2)" />
              <rect x="46" y="16" width="6" height="12" rx="2" fill="url(#grid-gradient-3)" />
              <rect x="12" y="32" width="12" height="10" rx="2" fill="url(#grid-gradient-2)" />
              <rect x="28" y="32" width="12" height="10" rx="2" fill="url(#grid-gradient-3)" />
              <rect x="44" y="32" width="8" height="10" rx="2" fill="url(#grid-gradient-1)" />
              <rect x="12" y="46" width="8" height="6" rx="2" fill="url(#grid-gradient-3)" />
              <rect x="24" y="46" width="14" height="6" rx="2" fill="url(#grid-gradient-1)" />
              <rect x="42" y="46" width="10" height="6" rx="2" fill="url(#grid-gradient-2)" />
            </svg>
          }
          title={t('featureCards.responsive.title')}
          description={t('featureCards.responsive.description')}
        />
      </section>

      {/* API Section */}
      <section className={styles.apiSection}>
        <SectionHeader
          title={t('api.title')}
          description={t('api.description')}
        />

        <div className={styles.apiDemo}>
          <BrowserWindow>
            <div className={styles.apiContent}>
              {[
                { label: 'w-1_12', width: '8%' },
                { label: 'w-2_3', width: '16%' },
                { label: 'w-2', width: '20%' },
                { label: 'w-5', width: '28%' },
                { label: 'w-4', width: '36%' },
                { label: 'w-3', width: '44%' },
                { label: 'w-2', width: '52%' },
                { label: 'w-1', width: '100%' },
              ].map((item, idx) => (
                <div key={idx} className={styles.apiBar}>
                  <div className={styles.apiBarFill} style={{ width: item.width }}>
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </BrowserWindow>
        </div>
      </section>

      {/* Components Section */}
      <section className={styles.componentsSection}>
        <SectionHeader
          title={t('components.title')}
          description={t('components.description')}
        />

        <div className={styles.componentsDemo}>
          <BrowserWindow title="Components Preview">
            <div className={styles.componentsGrid}>
              <div className={styles.componentDemo}>
                <div className={styles.componentLabel}>Avatar</div>
                <div className={styles.componentExample}>
                  <Avatar type="image" src="/cat.jpg" size={40} />
                  <Avatar type="icon" icon="icon-user" size={40} />
                  <Avatar type="text" text="AB" size={40} />
                  <Avatar type="image" src="/cat.jpg" size={40} activityRing />
                </div>
              </div>
              <div className={styles.componentDemo}>
                <div className={styles.componentLabel}>Button</div>
                <div className={styles.componentExample}>
                  <button className="primary">Primary</button>
                  <button className="success">Success</button>
                  <button className="danger">Danger</button>
                </div>
              </div>
              <div className={styles.componentDemo}>
                <div className={styles.componentLabel}>Input</div>
                <div className={styles.componentExample}>
                  <input type="text" placeholder="Enter text..." />
                  <input type="text" className="success" value="Valid input" readOnly />
                </div>
              </div>
              <div className={styles.componentDemo}>
                <div className={styles.componentLabel}>Select</div>
                <div className={styles.componentExample}>
                  <select>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
              <div className={styles.componentDemo}>
                <div className={styles.componentLabel}>Checkbox & Radio</div>
                <div className={styles.componentExample}>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Checkbox
                  </label>
                  <label>
                    <input type="radio" name="demo" defaultChecked />
                    Radio
                  </label>
                </div>
              </div>
              <div className={styles.componentDemo}>
                <div className={styles.componentLabel}>Toggle</div>
                <div className={styles.componentExample}>
                  <label>
                    <input type="checkbox" className="toggle" defaultChecked />
                    Toggle Switch
                  </label>
                </div>
              </div>
              <div className={styles.componentDemo}>
                <div className={styles.componentLabel}>Tab</div>
                <div className={styles.componentExample}>
                  <ul className="tabs w-full">
                    <li className="on">
                      <a href="#tab1">Tab 1</a>
                    </li>
                    <li>
                      <a href="#tab2">Tab 2</a>
                    </li>
                    <li>
                      <a href="#tab3">Tab 3</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </BrowserWindow>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <div className={styles.logoContainer}>
            <img src="/logo.svg" alt="Podo UI" width={48} height={48} />
          </div>
          <h2 className={styles.ctaTitle}>{t('cta.title')}</h2>
          <p className={styles.ctaDescription}>
            {formatText(t('cta.description'))}
          </p>
          <a
            href="https://github.com/hada0127/podo-ui"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            {t('cta.button')}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <img src="/logo.svg" alt="Podo UI" width={24} height={24} />
          </div>
          <p className={styles.footerText}>Made by <a href="https://www.instagram.com/figma_slot" target="_blank">전예진</a> · <a href="https://github.com/hada0127" target="_blank">이은규</a> MIT. Podo UI 2023</p>
        </div>
      </footer>
    </div>
  );
}
