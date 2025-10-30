import Image from 'next/image';
import Link from 'next/link';
import styles from './home.module.scss';

export default function Home() {
  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <Image src="/logo.svg" alt="Podo UI" width={64} height={64} priority />
          </div>
          <h1 className={styles.heroTitle}>
            HELLO 환영합니다
            <br />
            <span className={styles.brandName}>Podo UI</span>
          </h1>
          <p className={styles.heroDescription}>
            Podo UI는 빠르고 쉽게 반응형있는 구성하기 위한 오픈 소스 툴킷 입니다.
            <br />
            복사 & 붙여넣기만 디자인으로 구현으로든 제공되는 방문 오픈 소스 프론트엔드 입니다.
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
            <Link href="/getting-started/installation" className={styles.btnPrimary}>
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>깨끗하고 가벼운 구성요소</h2>
          <p className={styles.sectionDescription}>
            HTML5, SCSS를 UX/UI 디자인 요소를 구현한 웹과
            <br />
            로컬 프레임 프로젝트가 가능 네 버전의 프리미엄 UX/UI 디자인과 컬렉션 소스 다양한 컴포넌트 UI는
            <br />
            구성되는 사이트에 쉽고 빠르고 적용 이루어 다양한 레이아웃을 만들 수 있습니다.
          </p>
        </div>

        {/* Browser Mockup */}
        <div className={styles.browserMockup}>
          <div className={styles.browserWindow}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
              <div className={styles.browserUrl}>podo-ui</div>
            </div>
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
                    <div className={styles.mockButton}>Cancel</div>
                    <div className={styles.mockButton + ' ' + styles.primary}>Submit</div>
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
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className={styles.featureCards}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <i className="icon-layers"></i>
          </div>
          <h3>CSS 프레임워크</h3>
          <p>
            순수한 웹 프로젝트 뿐만 아니라 다른
            프레임워크 자바스크립트 라이브러리와
            사이트를 쉽고 빠르게 만들 수 있습니다.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <i className="icon-setting"></i>
          </div>
          <h3>오픈과 구성 요소</h3>
          <p>
            오픈 프로젝트는 다음 커뮤니티의 참여와
            컴포넌트 구성요소를 쉽게 다양한 오픈
            소스를 개선할 수 있습니다.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <i className="icon-hidden"></i>
          </div>
          <h3>깨끗하고 다크모드 지원</h3>
          <p>
            깨끗한 UI를 통한 사용자에게는 시각적
            피로를 줄이고 다양 야간 모드를 지원해
            기술 응답을 합니다.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <i className="icon-star"></i>
          </div>
          <h3>단청성 돼 도구에도스</h3>
          <p>
            다양한 UI/UX 요소에서는 도구에서
            커뮤니티 도움을 받으시거나 보안으로
            프로젝트 용량하게 대응합니다.
          </p>
        </div>
      </section>

      {/* API Section */}
      <section className={styles.apiSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>디자인 시스템을 위한 API</h2>
          <p className={styles.sectionDescription}>
            기본적 시스템 구조는 재사용 하면 색상, 간격, 타이포그래피 그외의 등
            <br />
            팀 내 설계된 디자인 시스템으로 구성함과 합쳐져 포함할 수 있습니다.
          </p>
        </div>

        <div className={styles.apiDemo}>
          <div className={styles.browserWindow}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            </div>
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
          </div>
        </div>
      </section>

      {/* Components Section */}
      <section className={styles.componentsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>원하는 구성요소를 조각하세요</h2>
          <p className={styles.sectionDescription}>
            내장 웹사이트 컨텐츠를 설정 값이 지정이 유용하게 입니다.
            <br />
            직접적인 디자인 시스템을 위해 다룬 podo.ui에서 이를 자유와 맞춤 모듈로서는 챔페인드로 제공합니다.
          </p>
        </div>

        <div className={styles.componentsDemo}>
          <div className={styles.browserWindow}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
              <div className={styles.browserTab}>user / primary</div>
            </div>
            <div className={styles.componentsGrid}>
              <div className={styles.componentBox}>
                <div className={styles.componentLabel}>light</div>
              </div>
              <div className={styles.componentBox}>
                <div className={styles.componentLabel}>dark</div>
              </div>
              <div className={styles.componentBox}>
                <div className={styles.componentLabel}>color={'{'} primary{'}'}</div>
              </div>
              <div className={styles.componentBox}>
                <div className={styles.componentLabel}>color{'{'} secondary{'}'}</div>
              </div>
              <div className={styles.componentBox}>
                <div className={styles.componentLabel}>padding={'{'}2{'}'}</div>
              </div>
              <div className={styles.componentBox}>
                <div className={styles.componentLabel}>margin={'{'}3{'}'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <div className={styles.logoContainer}>
            <Image src="/logo.svg" alt="Podo UI" width={48} height={48} />
          </div>
          <h2 className={styles.ctaTitle}>podo.ui를 응원해주세요</h2>
          <p className={styles.ctaDescription}>
            podo.ui 프레젠터로 응원해주시고 누구나 사용할 편리하게 하고
          </p>
          <a
            href="https://github.com/hada0127/podo-ui"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            응원하기
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <Image src="/logo.svg" alt="Podo UI" width={24} height={24} />
          </div>
          <p className={styles.footerText}>Made by 전예진 · 이은규 MIT ©podo.ui 2023</p>
        </div>
      </footer>
    </div>
  );
}
