'use client';
import styles from './page.module.scss';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import Form from '../../next';

function Page() {
  const [darkmode, setDarkmode] = useState('light');
  const [testValue, setTestValue] = useState('');
  const [testValue2, setTestValue2] = useState('');
  const [testValue3, setTestValue3] = useState('');
  const [testValue4, setTestValue4] = useState('');
  const [wrapValue, setWrapValue] = useState('');
  const [wrapClass, setWrapClass] = useState('');
  const testSchema = z.string().min(5, 'Too short');
  useEffect(() => {
    document.documentElement.setAttribute('data-color-tone', 'warm');
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', darkmode);
  });
  useEffect(() => {
    setWrapValue(`${testValue3}${testValue4}`);
  }, [testValue3, testValue4]);

  return (
    <div className={styles.app}>
      <header>
        <div>Sample Page</div>
        <label>
          <input
            type="radio"
            name="darkmode"
            checked={darkmode === 'auto'}
            onChange={() => setDarkmode('auto')}
          />
          auto
        </label>
        <label>
          <input
            type="radio"
            name="darkmode"
            checked={darkmode === 'light'}
            onChange={() => setDarkmode('light')}
          />
          light
        </label>
        <label>
          <input
            type="radio"
            name="darkmode"
            checked={darkmode === 'dark'}
            onChange={() => setDarkmode('dark')}
          />
          dark
        </label>
      </header>
      <main className="p-6">
        <article className="bg-1 p-6">
          <h2>Text</h2>
          <section>
            <h1>h1</h1>
            <h2>h2</h2>
            <h3>h3</h3>
            <p className="display1">display1</p>
            <p className="display2">display2</p>
            <p className="display3">display3</p>
            <p className="display4">display4</p>
            <p className="display5">display5</p>
            <p className="display6">display6</p>
            <p className="display7">display7</p>
            <p className="p1">p1</p>
            <p className="p2">p2</p>
            <p className="p3">p3, body</p>
            <p className="p3-semibold">p3-semibold</p>
            <p className="p4">p4</p>
            <p className="p4-semibold">p4-semibold</p>
            <p className="p5">p5</p>
            <p className="p5-semibold">p5-semibold</p>
          </section>
        </article>
        <article className="bg-1 p-6">
          <h2>Color</h2>
          <div className="grid grid-fix-5 guide">
            <div className="w-1_5 primary">primary</div>
            <div className="w-1_5 primary-fill">primary-fill</div>
            <div className="w-1_5 primary-bg">primary-bg</div>
            <div className="w-1_5 primary-border">primary-border</div>
            <div className="w-1_5 primary-border-fill">primary-border-fill</div>
            <div className="w-1_5 default">default</div>
            <div className="w-1_5 default-fill">default-fill</div>
            <div className="w-1_5 default-bg">default-bg</div>
            <div className="w-1_5 default-border">default-border</div>
            <div className="w-1_5 default-border-fill">default-border-fill</div>
            <div className="w-1_5 default-deep">default-deep</div>
            <div className="w-1_5 default-deep-fill">default-deep-fill</div>
            <div className="w-1_5 default-deep-bg">default-deep-bg</div>
            <div className="w-1_5 default-deep-border">default-deep-border</div>
            <div className="w-1_5 default-deep-border-fill">
              default-deep-border-fill
            </div>
            <div className="w-1_5 info">info</div>
            <div className="w-1_5 info-fill">info-fill</div>
            <div className="w-1_5 info-bg">info-bg</div>
            <div className="w-1_5 info-border">info-border</div>
            <div className="w-1_5 info-border-fill">info-border-fill</div>
            <div className="w-1_5 link">link</div>
            <div className="w-1_5 link-fill">link-fill</div>
            <div className="w-1_5 link-bg">link-bg</div>
            <div className="w-1_5 link-border">link-border</div>
            <div className="w-1_5 link-border-fill">link-border-fill</div>
            <div className="w-1_5 success">success</div>
            <div className="w-1_5 success-fill">success-fill</div>
            <div className="w-1_5 success-bg">success-bg</div>
            <div className="w-1_5 success-border">success-border</div>
            <div className="w-1_5 success-border-fill">success-border-fill</div>
            <div className="w-1_5 warning">warning</div>
            <div className="w-1_5 warning-fill">warning-fill</div>
            <div className="w-1_5 warning-bg">warning-bg</div>
            <div className="w-1_5 warning-border">warning-border</div>
            <div className="w-1_5 warning-border-fill">warning-border-fill</div>
            <div className="w-1_5 danger">danger</div>
            <div className="w-1_5 danger-fill">danger-fill</div>
            <div className="w-1_5 danger-bg">danger-bg</div>
            <div className="w-1_5 danger-border">danger-border</div>
            <div className="w-1_5 danger-border-fill">danger-border-fill</div>
          </div>
        </article>
        <article className="bg-1 p-6">
          <h2>Grid</h2>
          <section>
            <h3>Basic 12 Columns (Auto wrap)</h3>
            <div className="grid guide border p-5 bg-3">
              <div className="w-4">w-4</div>
              <div className="w-5">w-5</div>
              <div className="w-3">w-3</div>
              <div className="grid w-6">
                w-6
                <div className="w-12">w-12</div>
                <div className="w-2">w-2</div>
                <div className="w-6">w-6</div>
                <div className="w-4">w-4</div>
              </div>
              <div className="w-6">w-6</div>
              <div className="w-full">w-full</div>
            </div>
          </section>
          <section>
            <h3>Fixed Columns (No wrap)</h3>
            <h4>2 Columns (grid grid-fix-2)</h4>
            <div className="grid guide border grid-fix-2 p-5 bg-3">
              <div className="w-1_2">w-1_2</div>
              <div className="w-1_2">w-1_2</div>
            </div>
            <h4>3 Columns (grid grid-fix-3)</h4>
            <div className="grid guide border grid-fix-3 p-5 bg-3">
              <div className="w-1_3">w-1_3</div>
              <div className="w-2_3">w-2_3</div>
            </div>
            <h4>4 Columns (grid grid-fix-4)</h4>
            <div className="grid guide border grid-fix-4 p-5 bg-3">
              <div className="w-1_4">w-1_4</div>
              <div className="w-3_4">w-3_4</div>
              <div className="w-2_4">w-2_4</div>
              <div className="w-2_4">w-2_4</div>
            </div>
            <h4>5 Columns (grid grid-fix-5)</h4>
            <div className="grid guide border grid-fix-5 p-5">
              <div className="w-1_5">w-1_5</div>
              <div className="w-4_5">w-4_5</div>
              <div className="w-2_5">w-2_5</div>
              <div className="w-3_5">w-3_5</div>
            </div>
            <h4>6 Columns (grid grid-fix-6)</h4>
            <div className="grid guide border grid-fix-6 p-5">
              <div className="w-1_6">w-1_6</div>
              <div className="w-5_6">w-5_6</div>
              <div className="w-2_6">w-2_6</div>
              <div className="w-4_6">w-4_6</div>
              <div className="w-3_6">w-3_6</div>
              <div className="w-3_6">w-3_6</div>
            </div>
          </section>
        </article>
        <article className="bg-1 p-6">
          <h2>Layout</h2>
          <section>
            <h3>Border</h3>
            <div className="grid guide grid-fix-4">
              <div className="w-1_4 border-0">border-0</div>
              <div className="w-1_4 border-1">border-1</div>
              <div className="w-1_4 border-2">border-2</div>
              <div className="w-1_4 border-3">border-3</div>
            </div>
          </section>
          <section>
            <h3>Border-radius</h3>
            <div className="grid guide grid-fix-4">
              <div className="w-1_4 border-1 r-0 p-6">r-0</div>
              <div className="w-1_4 border-1 r-1 p-6">r-1</div>
              <div className="w-1_4 border-1 r-2 p-6">r-2</div>
              <div className="w-1_4 border-1 r-3 p-6">r-3</div>
              <div className="w-1_4 border-1 r-4 p-6">r-4</div>
              <div className="w-1_4 border-1 r-5 p-6">r-5</div>
              <div className="w-1_4 border-1 r-6 p-6">r-6</div>
              <div className="w-1_4 border-1 r-full p-6">r-full</div>
            </div>
          </section>
          <section>
            <h3>Spacing</h3>
            <div className="grid grid-fix-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <div>s({i});</div>
              ))}
            </div>
          </section>
          <section>
            <h3>Padding</h3>
            <p>
              전체 : p-0 ~ p-13
              <br />
              상단 : p-t-0 ~ p-t-13
              <br />
              우측 : p-r-0 ~ p-r-13
              <br />
              하단 : p-b-0 ~ p-b-13
              <br />
              좌측 : p-l-0 ~ p-l-13
              <br />
            </p>
            <div className="grid grid-fix-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className={`w-full border-1 p-${i} bg-info`}>
                  <div className="bg-info-light">p-{i}</div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3>Margin</h3>
            <p>
              전체 : m-0 ~ m-13
              <br />
              상단 : m-t-0 ~ m-t-13
              <br />
              우측 : m-r-0 ~ m-r-13
              <br />
              하단 : m-b-0 ~ m-b-13
              <br />
              좌측 : m-l-0 ~ m-l-13
              <br />
            </p>
            <div className="grid grid-fix-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className={`w-full border-1 m-${i} bg-info`}>
                  <div className="bg-info-light">m-{i}</div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3>Elevation</h3>
            <div className="grid grid-fix-4">
              <div className="w-1_4 bg-elevation p-3">
                <div className="bg-elevation-1 p-3 m-3">
                  <div className="bg-elevation-2 p-3 m-3">
                    <div className="bg-elevation-3 p-3 m-3">bg-elevation-3</div>
                    <span>bg-elevation-2</span>
                  </div>
                  <span>bg-elevation-1</span>
                </div>
                <span>bg-elevation</span>
              </div>
            </div>
            <h3>Shadow</h3>
            <div className="grid grid-fix-5">
              <div className="w-1_5 shadow-1 p-6">shadow-1</div>
              <div className="w-1_5 shadow-2 p-6">shadow-2</div>
              <div className="w-1_5 shadow-3 p-6">shadow-3</div>
              <div className="w-1_5 shadow-4 p-6">shadow-4</div>
              <div className="w-1_5 shadow-5 p-6">shadow-5</div>
            </div>
          </section>
          <section>
            <h3>Hide</h3>
            <div className="grid grid-fix-4">
              <div className="w-1_3 hide p-6">hide</div>
              <div className="w-1_3 hide-pc p-6">hide-pc</div>
              <div className="w-1_3 hide-tb p-6">hide-tb</div>
              <div className="w-1_3 hide-mo p-6">hide-mo</div>
            </div>
          </section>
          <section>
            <h3>Icon</h3>
            <div className="grid icons">
              <div className="w-2 p-6">
                <i className="icon-star"></i>star(e900)
              </div>
              <div className="w-2 p-6">
                <i className="icon-star-fill"></i>star-fill(e901)
              </div>
              <div className="w-2 p-6">
                <i className="icon-exchange-horizontally"></i>
                exchange-horizontally(e902)
              </div>
              <div className="w-2 p-6">
                <i className="icon-exchange-vertical"></i>
                exchange-vertical(e903)
              </div>
              <div className="w-2 p-6">
                <i className="icon-new-window"></i>new-window(e904)
              </div>
              <div className="w-2 p-6">
                <i className="icon-tag"></i>tag(e905)
              </div>
              <div className="w-2 p-6">
                <i className="icon-notification"></i>notification(e906)
              </div>
              <div className="w-2 p-6">
                <i className="icon-notification-stroke"></i>
                notification-stroke(e907)
              </div>
              <div className="w-2 p-6">
                <i className="icon-mail"></i>mail(e908)
              </div>
              <div className="w-2 p-6">
                <i className="icon-global"></i>global(e909)
              </div>
              <div className="w-2 p-6">
                <i className="icon-trash"></i>trash(e90a)
              </div>
              <div className="w-2 p-6">
                <i className="icon-dm"></i>dm(e90b)
              </div>
              <div className="w-2 p-6">
                <i className="icon-currency"></i>currency(e90c)
              </div>
              <div className="w-2 p-6">
                <i className="icon-print"></i>print(e90d)
              </div>
              <div className="w-2 p-6">
                <i className="icon-gps"></i>gps(e90e)
              </div>
              <div className="w-2 p-6">
                <i className="icon-ellipse"></i>ellipse(e90f)
              </div>
              <div className="w-2 p-6">
                <i className="icon-ellipse-stroke"></i>ellipse-stroke(e910)
              </div>
              <div className="w-2 p-6">
                <i className="icon-facebook"></i>facebook(e912)
              </div>
              <div className="w-2 p-6">
                <i className="icon-naver"></i>naver(e913)
              </div>
              <div className="w-2 p-6">
                <i className="icon-insta"></i>insta(e914)
              </div>
              <div className="w-2 p-6">
                <i className="icon-tiktok"></i>tiktok(e915)
              </div>
              <div className="w-2 p-6">
                <i className="icon-apple"></i>apple(e916)
              </div>
              <div className="w-2 p-6">
                <i className="icon-google"></i>google(e917)
              </div>
              <div className="w-2 p-6">
                <i className="icon-youtube"></i>youtube(e918)
              </div>
              <div className="w-2 p-6">
                <i className="icon-kakao"></i>kakao(e919)
              </div>
              <div className="w-2 p-6">
                <i className="icon-x"></i>x(e91a)
              </div>
              <div className="w-2 p-6">
                <i className="icon-arrow-dropdown"></i>arrow-dropdown(e91c)
              </div>
              <div className="w-2 p-6">
                <i className="icon-arrow-dropdown-up"></i>
                arrow-dropdown-up(e91d)
              </div>
              <div className="w-2 p-6">
                <i className="icon-check-small"></i>check-small(e91e)
              </div>
              <div className="w-2 p-6">
                <i className="icon-check"></i>check(e91f)
              </div>
              <div className="w-2 p-6">
                <i className="icon-show"></i>show(e920)
              </div>
              <div className="w-2 p-6">
                <i className="icon-hidden"></i>hidden(e921)
              </div>
              <div className="w-2 p-6">
                <i className="icon-fordid"></i>fordid(e922)
              </div>
              <div className="w-2 p-6">
                <i className="icon-upload-cloud"></i>upload-cloud(e923)
              </div>
              <div className="w-2 p-6">
                <i className="icon-share"></i>share(e924)
              </div>
              <div className="w-2 p-6">
                <i className="icon-excel"></i>excel(e925)
              </div>
              <div className="w-2 p-6">
                <i className="icon-cancel"></i>cancel(e926)
              </div>
              <div className="w-2 p-6">
                <i className="icon-arrow-left"></i>arrow-left(e927)
              </div>
              <div className="w-2 p-6">
                <i className="icon-arrow-right"></i>arrow-right(e928)
              </div>
              <div className="w-2 p-6">
                <i className="icon-arrow-up"></i>arrow-up(e929)
              </div>
              <div className="w-2 p-6">
                <i className="icon-arrow-down"></i>arrow-down(e92a)
              </div>
              <div className="w-2 p-6">
                <i className="icon-download"></i>download(e92b)
              </div>
              <div className="w-2 p-6">
                <i className="icon-upload"></i>upload(e92c)
              </div>
              <div className="w-2 p-6">
                <i className="icon-link-alt"></i>link-alt(e92d)
              </div>
              <div className="w-2 p-6">
                <i className="icon-link"></i>link(e92e)
              </div>
              <div className="w-2 p-6">
                <i className="icon-edit"></i>edit(e92f)
              </div>
              <div className="w-2 p-6">
                <i className="icon-pin"></i>pin(e930)
              </div>
              <div className="w-2 p-6">
                <i className="icon-flag"></i>flag(e931)
              </div>
              <div className="w-2 p-6">
                <i className="icon-hand"></i>hand(e932)
              </div>
              <div className="w-2 p-6">
                <i className="icon-zoom-in"></i>zoom-in(e933)
              </div>
              <div className="w-2 p-6">
                <i className="icon-zoom-out"></i>zoom-out(e934)
              </div>
              <div className="w-2 p-6">
                <i className="icon-chart"></i>chart(e935)
              </div>
              <div className="w-2 p-6">
                <i className="icon-temperature"></i>temperature(e936)
              </div>
              <div className="w-2 p-6">
                <i className="icon-turbine"></i>turbine(e937)
              </div>
              <div className="w-2 p-6">
                <i className="icon-layers"></i>layers(e938)
              </div>
              <div className="w-2 p-6">
                <i className="icon-compass"></i>compass(e939)
              </div>
              <div className="w-2 p-6">
                <i className="icon-flag-finish"></i>flag-finish(e93a)
              </div>
              <div className="w-2 p-6">
                <i className="icon-pressure"></i>pressure(e93b)
              </div>
              <div className="w-2 p-6">
                <i className="icon-pyramid-chart"></i>pyramid-chart(e93c)
              </div>
              <div className="w-2 p-6">
                <i className="icon-ruler"></i>ruler(e93d)
              </div>
              <div className="w-2 p-6">
                <i className="icon-contour"></i>contour(e93e)
              </div>
              <div className="w-2 p-6">
                <i className="icon-plus"></i>plus(e93f)
              </div>
              <div className="w-2 p-6">
                <i className="icon-minus"></i>minus(e940)
              </div>
              <div className="w-2 p-6">
                <i className="icon-warning"></i>warning(e941)
              </div>
              <div className="w-2 p-6">
                <i className="icon-user-stroke"></i>user-stroke(e942)
              </div>
              <div className="w-2 p-6">
                <i className="icon-user"></i>user(e943)
              </div>
              <div className="w-2 p-6">
                <i className="icon-menu"></i>menu(e944)
              </div>
              <div className="w-2 p-6">
                <i className="icon-time"></i>time(e945)
              </div>
              <div className="w-2 p-6">
                <i className="icon-search"></i>search(e949)
              </div>
              <div className="w-2 p-6">
                <i className="icon-close"></i>close(e94a)
              </div>
              <div className="w-2 p-6">
                <i className="icon-info"></i>info(e94b)
              </div>
              <div className="w-2 p-6">
                <i className="icon-danger"></i>danger(e94c)
              </div>
              <div className="w-2 p-6">
                <i className="icon-danger-fill"></i>danger-fill(e94d)
              </div>
              <div className="w-2 p-6">
                <i className="icon-expand-left"></i>expand-left(e94e)
              </div>
              <div className="w-2 p-6">
                <i className="icon-expand-right"></i>expand-right(e94f)
              </div>
              <div className="w-2 p-6">
                <i className="icon-expand-up"></i>expand-up(e950)
              </div>
              <div className="w-2 p-6">
                <i className="icon-expand-down"></i>expand-down(e951)
              </div>
              <div className="w-2 p-6">
                <i className="icon-calendar"></i>calendar(e952)
              </div>
              <div className="w-2 p-6">
                <i className="icon-paper"></i>paper(e953)
              </div>
              <div className="w-2 p-6">
                <i className="icon-import"></i>import(e954)
              </div>
              <div className="w-2 p-6">
                <i className="icon-export"></i>export(e955)
              </div>
              <div className="w-2 p-6">
                <i className="icon-img"></i>img(e956)
              </div>
              <div className="w-2 p-6">
                <i className="icon-favorite"></i>favorite(e957)
              </div>
              <div className="w-2 p-6">
                <i className="icon-favorite-fill"></i>favorite-fill(e958)
              </div>
              <div className="w-2 p-6">
                <i className="icon-phone"></i>phone(e959)
              </div>
              <div className="w-2 p-6">
                <i className="icon-phone-stroke"></i>phone-stroke(e95a)
              </div>
              <div className="w-2 p-6">
                <i className="icon-home"></i>home(e95b)
              </div>
              <div className="w-2 p-6">
                <i className="icon-expand-up-double"></i>expand-up-double(e95c)
              </div>
              <div className="w-2 p-6">
                <i className="icon-expand-down-double"></i>
                expand-down-double(e95d)
              </div>
              <div className="w-2 p-6">
                <i className="icon-expand-left-double"></i>
                expand-left-double(e95e)
              </div>
              <div className="w-2 p-6">
                <i className="icon-expand-right-double"></i>
                expand-right-double(e95f)
              </div>
              <div className="w-2 p-6">
                <i className="icon-setting-stroke"></i>setting-stroke(e960)
              </div>
              <div className="w-2 p-6">
                <i className="icon-setting"></i>setting(e961)
              </div>
              <div className="w-2 p-6">
                <i className="icon-email"></i>email(e962)
              </div>
              <div className="w-2 p-6">
                <i className="icon-more-horizontal"></i>more-horizontal(e963)
              </div>
              <div className="w-2 p-6">
                <i className="icon-more"></i>more(e964)
              </div>
              <div className="w-2 p-6">
                <i className="icon-help"></i>help(e965)
              </div>
              <div className="w-2 p-6">
                <i className="icon-check-circle-stroke"></i>
                check-circle-stroke(e966)
              </div>
              <div className="w-2 p-6">
                <i className="icon-check-circle-fill"></i>
                check-circle-fill(e967)
              </div>
              <div className="w-2 p-6">
                <i className="icon-map"></i>map(e968)
              </div>
              <div className="w-2 p-6">
                <i className="icon-refresh"></i>refresh(e969)
              </div>
              <div className="w-2 p-6">
                <i className="icon-drag"></i>drag(e96a)
              </div>
              <div className="w-2 p-6">
                <i className="icon-clip"></i>clip(e96b)
              </div>
              <div className="w-2 p-6">
                <i className="icon-file"></i>file(e96c)
              </div>
              <div className="w-2 p-6">
                <i className="icon-card"></i>card(e96d)
              </div>
              <div className="w-2 p-6">
                <i className="icon-car"></i>car(e96e)
              </div>
              <div className="w-2 p-6">
                <i className="icon-handle"></i>handle(e96f)
              </div>
              <div className="w-2 p-6">
                <i className="icon-counselor"></i>counselor(e970)
              </div>
              <div className="w-2 p-6">
                <i className="icon-chart-bar"></i>chart-bar(e971)
              </div>
              <div className="w-2 p-6">
                <i className="icon-coin"></i>coin(e972)
              </div>
              <div className="w-2 p-6">
                <i className="icon-receipt"></i>receipt(e973)
              </div>
              <div className="w-2 p-6">
                <i className="icon-briefcase"></i>briefcase(e974)
              </div>
              <div className="w-2 p-6">
                <i className="icon-arrow-dropdown-left"></i>
                arrow-dropdown-left(e975)
              </div>
              <div className="w-2 p-6">
                <i className="icon-arrow-dropdown-right"></i>
                arrow-dropdown-right(e976)
              </div>
              <div className="w-2 p-6">
                <i className="icon-lock"></i>
                lock(e977)
              </div>
              <div className="w-2 p-6">
                <i className="icon-unlock"></i>
                unlock(e978)
              </div>
            </div>
          </section>
        </article>
        <article className="bg-1 p-6">
          <h2>Button</h2>
          <section>
            <h3>Primary</h3>
            <div className="elements">
              <button className="primary">primary (sm)</button>
              <button className="primary">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="primary xs">primary xs</button>
              <button className="primary xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="primary md">primary md</button>
              <button className="primary md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="primary lg">primary lg</button>
              <button className="primary lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="primary-border">primary-border (sm)</button>
              <button className="primary-border">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="primary-border xs">primary-border xs</button>
              <button className="primary-border xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="primary-border md">primary-border md</button>
              <button className="primary-border md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="primary-border lg">primary-border lg</button>
              <button className="primary-border lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="primary-fill">primary-fill (sm)</button>
              <button className="primary-fill">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="primary-fill xs">primary-fill xs</button>
              <button className="primary-fill xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="primary-fill md">primary-fill md</button>
              <button className="primary-fill md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="primary-fill lg">primary-fill lg</button>
              <button className="primary-fill lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <div className="elements">
              <button className="primary-text">primary-text (sm)</button>
              <button className="primary-text">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="primary-text xs">primary-text xs</button>
              <button className="primary-text xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="primary-text md">primary-text md</button>
              <button className="primary-text md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="primary-text lg">primary-text lg</button>
              <button className="primary-text lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <h3>Default</h3>
            <div className="elements">
              <button className="default">default (sm)</button>
              <button className="default">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="default xs">default xs</button>
              <button className="default xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="default md">default md</button>
              <button className="default md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="default lg">default lg</button>
              <button className="default lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="default-border">default-border (sm)</button>
              <button className="default-border">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="default-border xs">default-border xs</button>
              <button className="default-border xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="default-border md">default-border md</button>
              <button className="default-border md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="default-border lg">default-border lg</button>
              <button className="default-border lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="default-fill">default-fill (sm)</button>
              <button className="default-fill">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="default-fill xs">default-fill xs</button>
              <button className="default-fill xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="default-fill md">default-fill md</button>
              <button className="default-fill md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="default-fill lg">default-fill lg</button>
              <button className="default-fill lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <div className="elements">
              <button className="default-text">default-text (sm)</button>
              <button className="default-text">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="default-text xs">default-text xs</button>
              <button className="default-text xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="default-text md">default-text md</button>
              <button className="default-text md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="default-text lg">default-text lg</button>
              <button className="default-text lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <h3>default-deep</h3>
            <div className="elements">
              <button className="default-deep">default-deep (sm)</button>
              <button className="default-deep">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep xs">default-deep xs</button>
              <button className="default-deep xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep md">default-deep md</button>
              <button className="default-deep md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep lg">default-deep lg</button>
              <button className="default-deep lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="default-deep-border">
                default-deep-border (sm)
              </button>
              <button className="default-deep-border">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep-border xs">
                default-deep-border xs
              </button>
              <button className="default-deep-border xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep-border md">
                default-deep-border md
              </button>
              <button className="default-deep-border md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep-border lg">
                default-deep-border lg
              </button>
              <button className="default-deep-border lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="default-deep-fill">
                default-deep-fill (sm)
              </button>
              <button className="default-deep-fill">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep-fill xs">
                default-deep-fill xs
              </button>
              <button className="default-deep-fill xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep-fill md">
                default-deep-fill md
              </button>
              <button className="default-deep-fill md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep-fill lg">
                default-deep-fill lg
              </button>
              <button className="default-deep-fill lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <div className="elements">
              <button className="default-deep-text">
                default-deep-text (sm)
              </button>
              <button className="default-deep-text">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep-text xs">
                default-deep-text xs
              </button>
              <button className="default-deep-text xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep-text md">
                default-deep-text md
              </button>
              <button className="default-deep-text md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="default-deep-text lg">
                default-deep-text lg
              </button>
              <button className="default-deep-text lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <h3>Info</h3>
            <div className="elements">
              <button className="info">info (sm)</button>
              <button className="info">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="info xs">info xs</button>
              <button className="info xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="info md">info md</button>
              <button className="info md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="info lg">info lg</button>
              <button className="info lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="info-border">info-border (sm)</button>
              <button className="info-border">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="info-border xs">info-border xs</button>
              <button className="info-border xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="info-border md">info-border md</button>
              <button className="info-border md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="info-border lg">info-border lg</button>
              <button className="info-border lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="info-fill">info-fill (sm)</button>
              <button className="info-fill">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="info-fill xs">info-fill xs</button>
              <button className="info-fill xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="info-fill md">info-fill md</button>
              <button className="info-fill md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="info-fill lg">info-fill lg</button>
              <button className="info-fill lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <div className="elements">
              <button className="info-text">info-text (sm)</button>
              <button className="info-text">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="info-text xs">info-text xs</button>
              <button className="info-text xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="info-text md">info-text md</button>
              <button className="info-text md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="info-text lg">info-text lg</button>
              <button className="info-text lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <h3>Link</h3>
            <div className="elements">
              <button className="link">link (sm)</button>
              <button className="link">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="link xs">link xs</button>
              <button className="link xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="link md">link md</button>
              <button className="link md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="link lg">link lg</button>
              <button className="link lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="link-border">link-border (sm)</button>
              <button className="link-border">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="link-border xs">link-border xs</button>
              <button className="link-border xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="link-border md">link-border md</button>
              <button className="link-border md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="link-border lg">link-border lg</button>
              <button className="link-border lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="link-fill">link-fill (sm)</button>
              <button className="link-fill">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="link-fill xs">link-fill xs</button>
              <button className="link-fill xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="link-fill md">link-fill md</button>
              <button className="link-fill md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="link-fill lg">link-fill lg</button>
              <button className="link-fill lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <div className="elements">
              <button className="link-text">link-text (sm)</button>
              <button className="link-text">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="link-text xs">link-text xs</button>
              <button className="link-text xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="link-text md">link-text md</button>
              <button className="link-text md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="link-text lg">link-text lg</button>
              <button className="link-text lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <h3>Success</h3>
            <div className="elements">
              <button className="success">success (sm)</button>
              <button className="success">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="success xs">success xs</button>
              <button className="success xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="success md">success md</button>
              <button className="success md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="success lg">success lg</button>
              <button className="success lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="success-border">success-border (sm)</button>
              <button className="success-border">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="success-border xs">success-border xs</button>
              <button className="success-border xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="success-border md">success-border md</button>
              <button className="success-border md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="success-border lg">success-border lg</button>
              <button className="success-border lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="success-fill">success-fill (sm)</button>
              <button className="success-fill">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="success-fill xs">success-fill xs</button>
              <button className="success-fill xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="success-fill md">success-fill md</button>
              <button className="success-fill md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="success-fill lg">success-fill lg</button>
              <button className="success-fill lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <div className="elements">
              <button className="success-text">success-text (sm)</button>
              <button className="success-text">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="success-text xs">success-text xs</button>
              <button className="success-text xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="success-text md">success-text md</button>
              <button className="success-text md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="success-text lg">success-text lg</button>
              <button className="success-text lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <h3>Warning</h3>
            <div className="elements">
              <button className="warning">warning (sm)</button>
              <button className="warning">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="warning xs">warning xs</button>
              <button className="warning xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="warning md">warning md</button>
              <button className="warning md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="warning lg">warning lg</button>
              <button className="warning lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="warning-border">warning-border (sm)</button>
              <button className="warning-border">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="warning-border xs">warning-border xs</button>
              <button className="warning-border xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="warning-border md">warning-border md</button>
              <button className="warning-border md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="warning-border lg">warning-border lg</button>
              <button className="warning-border lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="warning-fill">warning-fill (sm)</button>
              <button className="warning-fill">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="warning-fill xs">warning-fill xs</button>
              <button className="warning-fill xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="warning-fill md">warning-fill md</button>
              <button className="warning-fill md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="warning-fill lg">warning-fill lg</button>
              <button className="warning-fill lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <div className="elements">
              <button className="warning-text">warning-text (sm)</button>
              <button className="warning-text">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="warning-text xs">warning-text xs</button>
              <button className="warning-text xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="warning-text md">warning-text md</button>
              <button className="warning-text md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="warning-text lg">warning-text lg</button>
              <button className="warning-text lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <h3>Danger</h3>
            <div className="elements">
              <button className="danger">danger (sm)</button>
              <button className="danger">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="danger xs">danger xs</button>
              <button className="danger xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="danger md">danger md</button>
              <button className="danger md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="danger lg">danger lg</button>
              <button className="danger lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="danger-border">danger-border (sm)</button>
              <button className="danger-border">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="danger-border xs">danger-border xs</button>
              <button className="danger-border xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="danger-border md">danger-border md</button>
              <button className="danger-border md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="danger-border lg">danger-border lg</button>
              <button className="danger-border lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="danger-fill">danger-fill (sm)</button>
              <button className="danger-fill">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="danger-fill xs">danger-fill xs</button>
              <button className="danger-fill xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="danger-fill md">danger-fill md</button>
              <button className="danger-fill md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="danger-fill lg">danger-fill lg</button>
              <button className="danger-fill lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <div className="elements">
              <button className="danger-text">danger-text (sm)</button>
              <button className="danger-text">
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="danger-text xs">danger-text xs</button>
              <button className="danger-text xs">
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="danger-text md">danger-text md</button>
              <button className="danger-text md">
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="danger-text lg">danger-text lg</button>
              <button className="danger-text lg">
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <h3>Disabled</h3>
            <div className="elements">
              <button className="danger" disabled>
                danger (sm)
              </button>
              <button className="danger" disabled>
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="danger xs" disabled>
                danger xs
              </button>
              <button className="danger xs" disabled>
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="danger md" disabled>
                danger md
              </button>
              <button className="danger md" disabled>
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="danger lg" disabled>
                danger lg
              </button>
              <button className="danger lg" disabled>
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="danger-border" disabled>
                danger-border (sm)
              </button>
              <button className="danger-border" disabled>
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="danger-border xs" disabled>
                danger-border xs
              </button>
              <button className="danger-border xs" disabled>
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="danger-border md" disabled>
                danger-border md
              </button>
              <button className="danger-border md" disabled>
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="danger-border lg" disabled>
                danger-border lg
              </button>
              <button className="danger-border lg" disabled>
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>

            <div className="elements">
              <button className="danger-fill" disabled>
                danger-fill (sm)
              </button>
              <button className="danger-fill" disabled>
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="danger-fill xs" disabled>
                danger-fill xs
              </button>
              <button className="danger-fill xs" disabled>
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="danger-fill md" disabled>
                danger-fill md
              </button>
              <button className="danger-fill md" disabled>
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="danger-fill lg" disabled>
                danger-fill lg
              </button>
              <button className="danger-fill lg" disabled>
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
            <div className="elements">
              <button className="danger-text" disabled>
                danger-text (sm)
              </button>
              <button className="danger-text" disabled>
                <i className="icon-notification"></i>icon (sm)
                <i className="icon-notification"></i>
              </button>

              <button className="danger-text xs" disabled>
                danger-text xs
              </button>
              <button className="danger-text xs" disabled>
                <i className="icon-notification"></i>icon xs
                <i className="icon-notification"></i>
              </button>

              <button className="danger-text md" disabled>
                danger-text md
              </button>
              <button className="danger-text md" disabled>
                <i className="icon-notification"></i>icon md
                <i className="icon-notification"></i>
              </button>

              <button className="danger-text lg" disabled>
                danger-text lg
              </button>
              <button className="danger-text lg" disabled>
                <i className="icon-notification"></i>icon lg
                <i className="icon-notification"></i>
              </button>
            </div>
          </section>
        </article>
        <article>
          <h2>Toggle</h2>
          <section className="elements">
            <input type="checkbox" className="toggle" />
            <input type="checkbox" className="toggle" checked />
            <input type="checkbox" className="toggle" disabled />
            <input type="checkbox" className="toggle" checked disabled />
          </section>
        </article>
        <article>
          <h2 className="test">Checkbox</h2>
          <section>
            <div className="elements">
              <label>
                <input type="checkbox" />
                <span>Default</span>
              </label>
              <label>
                <input type="checkbox" checked />
                <span>Default checked</span>
              </label>
              <label>
                <input type="checkbox" disabled />
                <span>Disabled</span>
              </label>
              <label>
                <input type="checkbox" checked disabled />
                <span>Checked Disabled</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  ref={(el) => {
                    if (el) el.indeterminate = true;
                  }}
                />
                <span>Indeterminate</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  disabled
                  ref={(el) => {
                    if (el) el.indeterminate = true;
                  }}
                />
                <span>Indeterminate Disabled</span>
              </label>
            </div>
          </section>
        </article>
        <article>
          <h2>Radio</h2>
          <section>
            <div className="elements">
              <label>
                <input type="radio" name="dafault-radio" />
                <span>Default 1</span>
              </label>
              <label>
                <input type="radio" name="dafault-radio" checked />
                <span>Default 2</span>
              </label>
              <label>
                <input type="radio" disabled />
                <span>Disabled</span>
              </label>
              <label>
                <input type="radio" checked disabled />
                <span>Checked Disabled</span>
              </label>
            </div>
          </section>
        </article>
        <article>
          <h2>Input</h2>
          <section>
            <h3>Default Size(sm)</h3>
            <div className="elements">
              <input type="text" placeholder="default" />
              <input type="text" value="readOnly" readOnly />
              <input type="text" placeholder="success" className="success" />
              <input type="text" placeholder="danger" className="danger" />
              <input type="text" placeholder="disabled" disabled />
              <div className="with-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" />
              </div>
              <div className="with-right-icon">
                <input type="text" placeholder="icon" />
                <i className="icon-search"></i>
              </div>
              <div className="with-icon with-right-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" />
                <i className="icon-search"></i>
              </div>
            </div>
            <div className="elements">
              <input type="text" placeholder="fill" className="fill" />
              <input type="text" value="readOnly" className="fill" readOnly />
              <input
                type="text"
                placeholder="success"
                className="success fill"
              />
              <input type="text" placeholder="danger" className="danger fill" />
              <input
                type="text"
                placeholder="disabled"
                disabled
                className="fill"
              />
              <div className="with-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="fill" />
              </div>
              <div className="with-right-icon">
                <input type="text" placeholder="icon" className="fill" />
                <i className="icon-search"></i>
              </div>
              <div className="with-right-icon">
                <input type="text" placeholder="icon" className="fill"/>
              </div>
              <div className="with-icon with-right-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="fill" />
                <i className="icon-search"></i>
              </div>
            </div>

            <div className="elements">
              <input
                type="text"
                placeholder="underline"
                className="underline"
              />
              <input
                type="text"
                value="readOnly"
                className="underline"
                readOnly
              />
              <input
                type="text"
                placeholder="success"
                className="success underline"
              />
              <input
                type="text"
                placeholder="danger"
                className="danger underline"
              />
              <input
                type="text"
                placeholder="disabled"
                disabled
                className="underline"
              />
              <div className="with-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="underline" />
              </div>
              <div className="with-right-icon">
                <input type="text" placeholder="icon" className="underline" />
                <i className="icon-search"></i>
              </div>
              <div className="with-icon with-right-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="underline" />
                <i className="icon-search"></i>
              </div>
            </div>
          </section>

          <section>
            <h3>md</h3>
            <div className="elements">
              <input type="text" placeholder="default md" className="md" />
              <input type="text" value="readOnly" readOnly className="md" />
              <input type="text" placeholder="success" className="success md" />
              <input type="text" placeholder="danger" className="danger md" />
              <input
                type="text"
                placeholder="disabled"
                className="md"
                disabled
              />
              <div className="with-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="md" />
              </div>
              <div className="with-right-icon">
                <input type="text" placeholder="icon" className="md" />
                <i className="icon-search"></i>
              </div>
              <div className="with-icon with-right-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="md" />
                <i className="icon-search"></i>
              </div>
            </div>
            <div className="elements">
              <input type="text" placeholder="fill" className="fill md" />
              <input
                type="text"
                value="readOnly"
                className="fill md"
                readOnly
              />
              <input
                type="text"
                placeholder="success"
                className="success fill md"
              />
              <input
                type="text"
                placeholder="danger"
                className="danger fill md"
              />
              <input
                type="text"
                placeholder="disabled"
                disabled
                className="fill md"
              />
              <div className="with-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="fill md" />
              </div>
              <div className="with-right-icon">
                <input type="text" placeholder="icon" className="fill md" />
                <i className="icon-search"></i>
              </div>
              <div className="with-icon with-right-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="fill md" />
                <i className="icon-search"></i>
              </div>
            </div>

            <div className="elements">
              <input
                type="text"
                placeholder="underline"
                className="underline md"
              />
              <input
                type="text"
                value="readOnly"
                className="underline md"
                readOnly
              />
              <input
                type="text"
                placeholder="success"
                className="success underline md"
              />
              <input
                type="text"
                placeholder="danger"
                className="danger underline md"
              />
              <input
                type="text"
                placeholder="disabled"
                disabled
                className="underline md"
              />
              <div className="with-icon">
                <i className="icon-tag"></i>
                <input
                  type="text"
                  placeholder="icon"
                  className="underline md"
                />
              </div>
              <div className="with-right-icon">
                <input
                  type="text"
                  placeholder="icon"
                  className="underline md"
                />
                <i className="icon-search"></i>
              </div>
              <div className="with-icon with-right-icon">
                <i className="icon-tag"></i>
                <input
                  type="text"
                  placeholder="icon"
                  className="underline md"
                />
                <i className="icon-search"></i>
              </div>
            </div>
          </section>

          <section>
            <h3>lg</h3>
            <div className="elements">
              <input type="text" placeholder="default lg" className="lg" />
              <input type="text" value="readOnly" readOnly className="lg" />
              <input type="text" placeholder="success" className="success lg" />
              <input type="text" placeholder="danger" className="danger lg" />
              <input
                type="text"
                placeholder="disabled"
                className="lg"
                disabled
              />
              <div className="with-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="lg" />
              </div>
              <div className="with-right-icon">
                <input type="text" placeholder="icon" className="lg" />
                <i className="icon-search"></i>
              </div>
              <div className="with-icon with-right-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="lg" />
                <i className="icon-search"></i>
              </div>
            </div>
            <div className="elements">
              <input type="text" placeholder="fill" className="fill lg" />
              <input
                type="text"
                value="readOnly"
                className="fill lg"
                readOnly
              />
              <input
                type="text"
                placeholder="success"
                className="success fill lg"
              />
              <input
                type="text"
                placeholder="danger"
                className="danger fill lg"
              />
              <input
                type="text"
                placeholder="disabled"
                disabled
                className="fill lg"
              />
              <div className="with-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="fill lg" />
              </div>
              <div className="with-right-icon">
                <input type="text" placeholder="icon" className="fill lg" />
                <i className="icon-search"></i>
              </div>
              <div className="with-icon with-right-icon">
                <i className="icon-tag"></i>
                <input type="text" placeholder="icon" className="fill lg" />
                <i className="icon-search"></i>
              </div>
            </div>

            <div className="elements">
              <input
                type="text"
                placeholder="underline"
                className="underline lg"
              />
              <input
                type="text"
                value="readOnly"
                className="underline lg"
                readOnly
              />
              <input
                type="text"
                placeholder="success"
                className="success underline lg"
              />
              <input
                type="text"
                placeholder="danger"
                className="danger underline lg"
              />
              <input
                type="text"
                placeholder="disabled"
                disabled
                className="underline lg"
              />
              <div className="with-icon">
                <i className="icon-tag"></i>
                <input
                  type="text"
                  placeholder="icon"
                  className="underline lg"
                />
              </div>
              <div className="with-right-icon">
                <input
                  type="text"
                  placeholder="icon"
                  className="underline lg"
                />
                <i className="icon-search"></i>
              </div>
              <div className="with-icon with-right-icon">
                <i className="icon-tag"></i>
                <input
                  type="text"
                  placeholder="icon"
                  className="underline lg"
                />
                <i className="icon-search"></i>
              </div>
            </div>
          </section>
        </article>
        <article>
          <h2>File</h2>
          <section className="elements">
            <input type="file" />
            <input type="file" disabled />
          </section>
        </article>
        <article>
          <h2>Select</h2>
          <section className="elements">
            <select>
              <option>default</option>
              <option>Seoul</option>
              <option>Tokyo</option>
            </select>
            <div className="with-icon">
              <i className="icon-global"></i>
              <select>
                <option>default</option>
                <option>Seoul</option>
                <option>Tokyo</option>
              </select>
            </div>
            <select required>
              <option value="" disabled selected>
                placeholder
              </option>
              <option>Seoul</option>
              <option>Tokyo</option>
            </select>
            <select disabled>
              <option>default</option>
              <option>Seoul</option>
              <option>Tokyo</option>
            </select>
          </section>
        </article>
        <article>
          <h2>Textarea</h2>
          <section className="elements">
            <textarea placeholder="placeholder"></textarea>
            <textarea readOnly>readOnly</textarea>
            <textarea
              placeholder="resize-none"
              className="resize-none"
            ></textarea>
            <textarea placeholder="success" className="success"></textarea>
            <textarea placeholder="danger" className="danger"></textarea>
            <textarea placeholder="disabled" disabled></textarea>
          </section>
        </article>
        <article>
          <h2>label</h2>
          <section>
            <label>md(default)</label>
            <br />
            <label className="semibold">semibold</label>
            <br />
            <label className="disabled">disabled</label>
            <br />
            <label className="lg">lg</label>
            <br />
            <label className="semibold lg">semibold lg</label>
            <br />
            <label className="disabled lg">disabled lg</label>
            <br />
            <label className="sm">sm</label>
            <br />
            <label className="semibold sm">semibold sm</label>
            <br />
            <label className="disabled sm">disabled sm</label>
            <br />
          </section>
        </article>
        <article>
          <h2>Field</h2>
          <section>
            <h3>Form.Field</h3>
            <div>import Form from '@the-flexion/pkg/next';</div>
            <div>
              &lt;Form.Field label="Title" helper="Helper Text"
              helperClass="danger" &gt; &lt;input type="text" /&gt;
              &lt;/Form.Field&gt;
            </div>
            <Form.Field label="Title" helper="Helper Text" helperClass="danger">
              <input type="text" />
            </Form.Field>
            <div>
              &lt;Form.Field label="Title" labelClass="lg semibold"
              required=&#123;true&#125; helper="Helper Text" &gt; &lt;input
              type="text" /&gt; &lt;/Form.Field&gt;
            </div>
            <Form.Field
              label="Title"
              labelClass="lg semibold"
              required={true}
              helper="Helper Text"
            >
              <input type="text" />
            </Form.Field>
          </section>
        </article>
        <article>
          <h2>Editor</h2>
          <section>
            <h3>Form.Editor</h3>
            <div>import Form from '@the-flexion/pkg/next';</div>
            <div>
              &lt;Form.Editor value=&#123;testValue&#125;
              onChange=&#123;setTestValue&#125; imageUploadUrl="/upload" /&gt;
            </div>
            <Form.Editor
              value={testValue2}
              onChange={setTestValue2}
              imageUploadUrl="/upload"
            />
            <div dangerouslySetInnerHTML={{ __html: testValue2 }}></div>
          </section>
        </article>

        <article>
          <h2>Validator</h2>
          <section>
            <h3>Form.Input</h3>
            <div>import Form from '@the-flexion/pkg/next';</div>
            <div>const testSchema = z.string().min(5, 'Too short');</div>
            <pre>
              &lt;Form.Input type="text" value=&#123;testValue&#125; onChange=
              &#123;(e) =&gt; &#123; setTestValue(e.target.value); &#125;&#125;
              validator=&#123;testSchema&#125;/&gt;
            </pre>
            <div>
              <Form.Input
                type="text"
                value={testValue}
                onChange={(e) => {
                  setTestValue(e.target.value);
                }}
                validator={testSchema}
              />
            </div>
            <pre>
              &lt;Form.Input type="text" value=&#123;testValue&#125; onChange=
              &#123;(e) =&gt; &#123; setTestValue(e.target.value); &#125;&#125;
              validator=&#123;testSchema&#125; unit=&#123;Unit&#125; /&gt;
            </pre>
            <div>
              <Form.Input
                type="number"
                value={testValue}
                onChange={(e) => {
                  setTestValue(e.target.value);
                }}
                validator={testSchema}
                unit="Unit"
              />
            </div>
          </section>
          <section>
            <h3>Form.Textarea</h3>
            <pre>
              &lt;Form.Textarea value=&#123;testValue&#125; rows=&#123;5&#125;
              className="w-full" onChange= &#123;(e) =&gt; &#123;
              setTestValue(e.target.value); &#125;&#125;
              validator=&#123;testSchema&#125; /&gt;
            </pre>
            <div className="w-full">
              <Form.Textarea
                value={testValue}
                rows={5}
                onChange={(e) => {
                  setTestValue(e.target.value);
                }}
                className="w-full"
                validator={testSchema}
              />
            </div>
          </section>
          <section>
            <h3>Form.Field</h3>
            <pre>
              &lt;Form.Field validator=&#123;testSchema&#125;
              value=&#123;wrapValue&#125; setClassName=&#123;setWrapClass&#125;
              &gt; &lt;... className=&#123;wrapClass&#125;/&gt;
              &lt;/Form.Field&gt;
            </pre>
            <div className="w-full">
              <Form.Field
                validator={testSchema}
                value={wrapValue}
                setClassName={setWrapClass}
              >
                <div>
                  <input
                    type="text"
                    value={testValue3}
                    className={`${wrapClass} m-r-3`}
                    onChange={(e) => setTestValue3(e.target.value)}
                  />
                  <input
                    type="text"
                    value={testValue4}
                    className={wrapClass}
                    onChange={(e) => setTestValue4(e.target.value)}
                  />
                </div>
              </Form.Field>
            </div>
          </section>
        </article>
        <article>
          <h2>Tabs</h2>
          <section>
            <h3>Default</h3>
            <ul className="tabs">
              <li className="on">
                <a href="#">
                  <i className="icon-heart"></i> Tab1
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="icon-heart primary"></i> Tab2
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="icon-heart danger"></i> Tab3
                </a>
              </li>
            </ul>
          </section>
          <section>
            <h3>fill</h3>
            <ul className="tabs fill">
              <li className="on">
                <a href="#">
                  <i className="icon-heart"></i> Tab1
                </a>
              </li>
              <li>
                <a href="#">Tab2</a>
              </li>
              <li>
                <a href="#">Tab3</a>
              </li>
            </ul>
          </section>
        </article>
        <article>
          <h2>Table</h2>
          <section>
            <h3>Default</h3>
            <table>
              <colgroup>
                <col width="40" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="100" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>제목</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>이름</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <section>
            <h3>list</h3>
            <table className="list">
              <colgroup>
                <col width="40" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="100" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>제목</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>이름</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3>border</h3>
            <table className="border">
              <colgroup>
                <col width="40" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="100" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>제목</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>이름</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3>list + border</h3>
            <table className="list border">
              <colgroup>
                <col width="40" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="100" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>제목</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>이름</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3>fill</h3>
            <table className="fill">
              <colgroup>
                <col width="40" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="100" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>제목</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>이름</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3>list + fill</h3>
            <table className="list fill">
              <colgroup>
                <col width="40" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="*" />
                <col width="100" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>제목</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>이름</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <button className="link text xs">편집하기</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </article>
      </main>
    </div>
  );
}

export default Page;
