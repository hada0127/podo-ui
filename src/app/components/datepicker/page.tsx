'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import DatePicker, { DatePickerValue, TimeValue } from '../../../../react/molecule/datepicker';
import styles from './page.module.scss';

export default function DatePickerPage() {
  const t = useTranslations('datepicker');

  // State for demos
  const [instantDate, setInstantDate] = useState<DatePickerValue>({});
  const [periodDate, setPeriodDate] = useState<DatePickerValue>({});
  const [instantTime, setInstantTime] = useState<DatePickerValue>({});
  const [periodTime, setPeriodTime] = useState<DatePickerValue>({});
  const [instantDateTime, setInstantDateTime] = useState<DatePickerValue>({});
  const [periodDateTime, setPeriodDateTime] = useState<DatePickerValue>({});

  // Min/Max Date demo states
  const [minMaxDate, setMinMaxDate] = useState<DatePickerValue>({});
  const [minMaxDateTime, setMinMaxDateTime] = useState<DatePickerValue>({});

  // States demo
  const [statesDefault, setStatesDefault] = useState<DatePickerValue>({});
  const [statesWithValue, setStatesWithValue] = useState<DatePickerValue>({ date: new Date() });

  // Disabling demo states
  const [disableSpecific, setDisableSpecific] = useState<DatePickerValue>({});
  const [disableRange, setDisableRange] = useState<DatePickerValue>({});
  const [disableFunction, setDisableFunction] = useState<DatePickerValue>({});
  const [enableOnly, setEnableOnly] = useState<DatePickerValue>({});

  // Minute Step demo states
  const [minuteStep1, setMinuteStep1] = useState<DatePickerValue>({});
  const [minuteStep5, setMinuteStep5] = useState<DatePickerValue>({});
  const [minuteStep10, setMinuteStep10] = useState<DatePickerValue>({});
  const [minuteStep15, setMinuteStep15] = useState<DatePickerValue>({});
  const [minuteStep20, setMinuteStep20] = useState<DatePickerValue>({});
  const [minuteStep30, setMinuteStep30] = useState<DatePickerValue>({});

  const formatDateDisplay = (value: DatePickerValue): string => {
    if (!value.date) return '-';
    const format = (d: Date) => d.toLocaleDateString('ko-KR');
    if (value.endDate) {
      return `${format(value.date)} ~ ${format(value.endDate)}`;
    }
    return format(value.date);
  };

  const formatTimeValue = (time: TimeValue): string => {
    return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
  };

  const formatTimeDisplay = (value: DatePickerValue): string => {
    if (!value.time) return '-';
    if (value.endTime) {
      return `${formatTimeValue(value.time)} ~ ${formatTimeValue(value.endTime)}`;
    }
    return formatTimeValue(value.time);
  };

  const formatDateTimeDisplay = (value: DatePickerValue): string => {
    if (!value.date) return '-';
    const formatDate = (d: Date) => d.toLocaleDateString('ko-KR');
    const formatTime = (t?: TimeValue) => t ? formatTimeValue(t) : '00:00';

    const startStr = `${formatDate(value.date)} ${formatTime(value.time)}`;
    if (value.endDate) {
      const endStr = `${formatDate(value.endDate)} ${formatTime(value.endTime)}`;
      return `${startStr} ~ ${endStr}`;
    }
    return startStr;
  };

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      {/* Basic Usage */}
      <section className={styles.section}>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TSX</div>
          <pre><code>{`import { DatePicker } from 'podo-ui';

// 단일 날짜 선택
<DatePicker
  mode="instant"
  type="date"
  value={value}
  onChange={setValue}
/>

// 기간 선택
<DatePicker
  mode="period"
  type="date"
  value={value}
  onChange={setValue}
/>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('basicUsage.demoTitle')}</div>
          <div className={styles.pickerRow}>
            <div className={styles.pickerItem}>
              <label>{t('basicUsage.instant')}</label>
              <DatePicker
                mode="instant"
                type="date"
                value={instantDate}
                onChange={setInstantDate}
              />
              <div className={styles.selectedValue}>
                {t('basicUsage.selected')}: {formatDateDisplay(instantDate)}
              </div>
            </div>
            <div className={styles.pickerItem}>
              <label>{t('basicUsage.period')}</label>
              <DatePicker
                mode="period"
                type="date"
                value={periodDate}
                onChange={setPeriodDate}
              />
              <div className={styles.selectedValue}>
                {t('basicUsage.selected')}: {formatDateDisplay(periodDate)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types */}
      <section className={styles.section}>
        <h2>{t('types.title')}</h2>
        <p>{t('types.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('types.demoTitle')}</div>
          <div className={styles.typeGrid}>
            {/* Date Only */}
            <div className={styles.typeCard}>
              <h4>type=&quot;date&quot;</h4>
              <p>{t('types.date')}</p>
              <DatePicker
                mode="instant"
                type="date"
                value={instantDate}
                onChange={setInstantDate}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(instantDate)}
              </div>
            </div>

            {/* Time Only */}
            <div className={styles.typeCard}>
              <h4>type=&quot;time&quot;</h4>
              <p>{t('types.time')}</p>
              <DatePicker
                mode="instant"
                type="time"
                value={instantTime}
                onChange={setInstantTime}
              />
              <div className={styles.selectedValue}>
                {formatTimeDisplay(instantTime)}
              </div>
            </div>

            {/* DateTime */}
            <div className={styles.typeCard}>
              <h4>type=&quot;datetime&quot;</h4>
              <p>{t('types.datetime')}</p>
              <DatePicker
                mode="instant"
                type="datetime"
                value={instantDateTime}
                onChange={setInstantDateTime}
              />
              <div className={styles.selectedValue}>
                {formatDateTimeDisplay(instantDateTime)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TSX</div>
          <pre><code>{`// 날짜만 선택
<DatePicker type="date" />

// 시간만 선택
<DatePicker type="time" />

// 날짜 + 시간
<DatePicker type="datetime" />`}</code></pre>
        </div>
      </section>

      {/* Period Mode */}
      <section className={styles.section}>
        <h2>{t('period.title')}</h2>
        <p>{t('period.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('period.demoTitle')}</div>
          <div className={styles.typeGrid}>
            {/* Period Date */}
            <div className={styles.typeCard}>
              <h4>{t('period.dateRange')}</h4>
              <DatePicker
                mode="period"
                type="date"
                value={periodDate}
                onChange={setPeriodDate}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(periodDate)}
              </div>
            </div>

            {/* Period Time */}
            <div className={styles.typeCard}>
              <h4>{t('period.timeRange')}</h4>
              <DatePicker
                mode="period"
                type="time"
                value={periodTime}
                onChange={setPeriodTime}
              />
              <div className={styles.selectedValue}>
                {formatTimeDisplay(periodTime)}
              </div>
            </div>

            {/* Period DateTime */}
            <div className={styles.typeCard}>
              <h4>{t('period.datetimeRange')}</h4>
              <DatePicker
                mode="period"
                type="datetime"
                value={periodDateTime}
                onChange={setPeriodDateTime}
              />
              <div className={styles.selectedValue}>
                {formatDateTimeDisplay(periodDateTime)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TSX</div>
          <pre><code>{`// 기간 날짜 선택
<DatePicker mode="period" type="date" />

// 기간 시간 선택
<DatePicker mode="period" type="time" />

// 기간 날짜+시간 선택
<DatePicker mode="period" type="datetime" />`}</code></pre>
        </div>
      </section>

      {/* States */}
      <section className={styles.section}>
        <h2>{t('states.title')}</h2>
        <p>{t('states.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('states.demoTitle')}</div>
          <div className={styles.pickerRow}>
            <div className={styles.pickerItem}>
              <label>{t('states.default')}</label>
              <DatePicker
                type="date"
                value={statesDefault}
                onChange={setStatesDefault}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(statesDefault)}
              </div>
            </div>
            <div className={styles.pickerItem}>
              <label>{t('states.disabled')}</label>
              <DatePicker type="date" disabled />
            </div>
            <div className={styles.pickerItem}>
              <label>{t('states.withValue')}</label>
              <DatePicker
                type="date"
                value={statesWithValue}
                onChange={setStatesWithValue}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(statesWithValue)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TSX</div>
          <pre><code>{`// 기본 상태
<DatePicker type="date" />

// 비활성화
<DatePicker type="date" disabled />

// 초기값 설정
<DatePicker type="date" value={{ date: new Date() }} />`}</code></pre>
        </div>
      </section>

      {/* Props */}
      <section className={styles.section}>
        <h2>{t('props.title')}</h2>
        <p>{t('props.description')}</p>

        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>mode</code></td>
              <td><code>&apos;instant&apos; | &apos;period&apos;</code></td>
              <td><code>&apos;instant&apos;</code></td>
              <td>{t('props.mode')}</td>
            </tr>
            <tr>
              <td><code>type</code></td>
              <td><code>&apos;date&apos; | &apos;time&apos; | &apos;datetime&apos;</code></td>
              <td><code>&apos;date&apos;</code></td>
              <td>{t('props.type')}</td>
            </tr>
            <tr>
              <td><code>value</code></td>
              <td><code>{`{ date?: Date, time?: TimeValue, endDate?: Date, endTime?: TimeValue }`}</code></td>
              <td><code>-</code></td>
              <td>{t('props.value')}</td>
            </tr>
            <tr>
              <td><code>onChange</code></td>
              <td><code>(value) =&gt; void</code></td>
              <td><code>-</code></td>
              <td>{t('props.onChange')}</td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td><code>string</code></td>
              <td><code>-</code></td>
              <td>{t('props.placeholder')}</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('props.disabled')}</td>
            </tr>
            <tr>
              <td><code>showActions</code></td>
              <td><code>boolean</code></td>
              <td><code>period: true</code></td>
              <td>{t('props.showActions')}</td>
            </tr>
            <tr>
              <td><code>align</code></td>
              <td><code>&apos;left&apos; | &apos;right&apos;</code></td>
              <td><code>&apos;left&apos;</code></td>
              <td>{t('props.align')}</td>
            </tr>
            <tr>
              <td><code>disable</code></td>
              <td><code>DateCondition[]</code></td>
              <td><code>-</code></td>
              <td>{t('props.disable')}</td>
            </tr>
            <tr>
              <td><code>enable</code></td>
              <td><code>DateCondition[]</code></td>
              <td><code>-</code></td>
              <td>{t('props.enable')}</td>
            </tr>
            <tr>
              <td><code>minDate</code></td>
              <td><code>Date | DateTimeLimit</code></td>
              <td><code>-</code></td>
              <td>{t('props.minDate')}</td>
            </tr>
            <tr>
              <td><code>maxDate</code></td>
              <td><code>Date | DateTimeLimit</code></td>
              <td><code>-</code></td>
              <td>{t('props.maxDate')}</td>
            </tr>
            <tr>
              <td><code>minuteStep</code></td>
              <td><code>1 | 5 | 10 | 15 | 20 | 30</code></td>
              <td><code>1</code></td>
              <td>{t('props.minuteStep')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Value Interface */}
      <section className={styles.section}>
        <h2>{t('valueInterface.title')}</h2>
        <p>{t('valueInterface.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// 시간 값 인터페이스
interface TimeValue {
  hour: number;   // 0-23
  minute: number; // 0-59
}

// DatePicker 값 인터페이스
interface DatePickerValue {
  date?: Date;        // 시작 날짜 (년, 월, 일)
  time?: TimeValue;   // 시작 시간 (시, 분)
  endDate?: Date;     // 종료 날짜 - period 모드
  endTime?: TimeValue; // 종료 시간 - period 모드
}`}</code></pre>
        </div>

        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>{t('valueInterface.field')}</th>
              <th>{t('valueInterface.type')}</th>
              <th>{t('valueInterface.usedIn')}</th>
              <th>{t('valueInterface.fieldDescription')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>date</code></td>
              <td><code>Date</code></td>
              <td><code>date, datetime</code></td>
              <td>{t('valueInterface.date')}</td>
            </tr>
            <tr>
              <td><code>time</code></td>
              <td><code>TimeValue</code></td>
              <td><code>time, datetime</code></td>
              <td>{t('valueInterface.time')}</td>
            </tr>
            <tr>
              <td><code>endDate</code></td>
              <td><code>Date</code></td>
              <td><code>period + date/datetime</code></td>
              <td>{t('valueInterface.endDate')}</td>
            </tr>
            <tr>
              <td><code>endTime</code></td>
              <td><code>TimeValue</code></td>
              <td><code>period + time/datetime</code></td>
              <td>{t('valueInterface.endTime')}</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('valueInterface.exampleTitle')}</div>
          <pre><code>{`// 날짜만 선택 (type="date")
const dateValue: DatePickerValue = {
  date: new Date(2024, 0, 15), // 2024년 1월 15일
};

// 시간만 선택 (type="time")
const timeValue: DatePickerValue = {
  time: { hour: 14, minute: 30 }, // 14:30
};

// 날짜+시간 선택 (type="datetime")
const datetimeValue: DatePickerValue = {
  date: new Date(2024, 0, 15),
  time: { hour: 14, minute: 30 },
};

// 기간 선택 (mode="period", type="date")
const periodValue: DatePickerValue = {
  date: new Date(2024, 0, 15),    // 시작일
  endDate: new Date(2024, 0, 20), // 종료일
};

// 기간+시간 선택 (mode="period", type="datetime")
const periodDatetimeValue: DatePickerValue = {
  date: new Date(2024, 0, 15),
  time: { hour: 9, minute: 0 },
  endDate: new Date(2024, 0, 20),
  endTime: { hour: 18, minute: 0 },
};`}</code></pre>
        </div>
      </section>

      {/* Disabling Dates */}
      <section className={styles.section}>
        <h2>{t('disabling.title')}</h2>
        <p>{t('disabling.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('disabling.demoTitle')}</div>
          <div className={styles.typeGrid}>
            {/* Disable Specific Dates */}
            <div className={styles.typeCard}>
              <h4>{t('disabling.specificDates')}</h4>
              <p>{t('disabling.specificDatesDesc')}</p>
              <DatePicker
                type="date"
                value={disableSpecific}
                onChange={setDisableSpecific}
                disable={[
                  new Date(new Date().getFullYear(), new Date().getMonth(), 10),
                  new Date(new Date().getFullYear(), new Date().getMonth(), 15),
                  new Date(new Date().getFullYear(), new Date().getMonth(), 20),
                ]}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(disableSpecific)}
              </div>
            </div>

            {/* Disable Date Range */}
            <div className={styles.typeCard}>
              <h4>{t('disabling.dateRange')}</h4>
              <p>{t('disabling.dateRangeDesc')}</p>
              <DatePicker
                type="date"
                value={disableRange}
                onChange={setDisableRange}
                disable={[
                  {
                    from: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
                    to: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
                  },
                ]}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(disableRange)}
              </div>
            </div>

            {/* Disable with Function */}
            <div className={styles.typeCard}>
              <h4>{t('disabling.function')}</h4>
              <p>{t('disabling.functionDesc')}</p>
              <DatePicker
                type="date"
                value={disableFunction}
                onChange={setDisableFunction}
                disable={[
                  (date: Date) => date.getDay() === 0 || date.getDay() === 6,
                ]}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(disableFunction)}
              </div>
            </div>

            {/* Enable Only Specific Dates */}
            <div className={styles.typeCard}>
              <h4>{t('disabling.enableOnly')}</h4>
              <p>{t('disabling.enableOnlyDesc')}</p>
              <DatePicker
                type="date"
                value={enableOnly}
                onChange={setEnableOnly}
                enable={[
                  {
                    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    to: new Date(new Date().getFullYear(), new Date().getMonth(), 7),
                  },
                ]}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(enableOnly)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TSX</div>
          <pre><code>{`// 특정 날짜 비활성화
<DatePicker
  type="date"
  disable={[
    new Date(2024, 0, 10), // 2024년 1월 10일
    new Date(2024, 0, 15), // 2024년 1월 15일
  ]}
/>

// 날짜 범위 비활성화
<DatePicker
  type="date"
  disable={[
    { from: new Date(2024, 0, 5), to: new Date(2024, 0, 12) },
  ]}
/>

// 함수로 비활성화 (주말 비활성화)
<DatePicker
  type="date"
  disable={[
    (date) => date.getDay() === 0 || date.getDay() === 6,
  ]}
/>

// 특정 날짜만 활성화
<DatePicker
  type="date"
  enable={[
    { from: new Date(2024, 0, 1), to: new Date(2024, 0, 7) },
  ]}
/>`}</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// 날짜 범위 인터페이스
interface DateRange {
  from: Date;
  to: Date;
}

// 날짜 조건 타입
type DateCondition =
  | Date                        // 특정 날짜
  | DateRange                   // 날짜 범위
  | ((date: Date) => boolean);  // 조건 함수`}</code></pre>
        </div>
      </section>

      {/* Min/Max Date */}
      <section className={styles.section}>
        <h2>{t('minMax.title')}</h2>
        <p>{t('minMax.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('minMax.demoTitle')}</div>
          <div className={styles.typeGrid}>
            {/* Date Only Limit */}
            <div className={styles.typeCard}>
              <h4>{t('minMax.dateOnly')}</h4>
              <p>{t('minMax.dateOnlyDesc')}</p>
              <DatePicker
                type="date"
                value={minMaxDate}
                onChange={setMinMaxDate}
                minDate={new Date()}
                maxDate={new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(minMaxDate)}
              </div>
            </div>

            {/* Date + Time Limit */}
            <div className={styles.typeCard}>
              <h4>{t('minMax.withTime')}</h4>
              <p>{t('minMax.withTimeDesc')}</p>
              <DatePicker
                type="datetime"
                value={minMaxDateTime}
                onChange={setMinMaxDateTime}
                minDate={{
                  date: new Date(),
                  time: { hour: 9, minute: 0 },
                }}
                maxDate={{
                  date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                  time: { hour: 18, minute: 0 },
                }}
              />
              <div className={styles.selectedValue}>
                {formatDateTimeDisplay(minMaxDateTime)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TSX</div>
          <pre><code>{`// 날짜만 제한 (Date 객체)
<DatePicker
  type="date"
  minDate={new Date()}                    // 오늘부터
  maxDate={new Date(2024, 11, 31)}        // 2024년 12월 31일까지
/>

// 날짜+시간 제한 (DateTimeLimit 객체)
<DatePicker
  type="datetime"
  minDate={{
    date: new Date(),
    time: { hour: 9, minute: 0 },        // 오늘 09:00부터
  }}
  maxDate={{
    date: new Date(2024, 11, 31),
    time: { hour: 18, minute: 0 },       // 2024-12-31 18:00까지
  }}
/>`}</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// 날짜+시간 제한 인터페이스
interface DateTimeLimit {
  date: Date;
  time?: TimeValue; // { hour: number, minute: number }
}

// minDate/maxDate 타입
type MinMaxDate = Date | DateTimeLimit;`}</code></pre>
        </div>
      </section>

      {/* Minute Step */}
      <section className={styles.section}>
        <h2>{t('minuteStep.title')}</h2>
        <p>{t('minuteStep.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('minuteStep.demoTitle')}</div>
          <div className={styles.typeGrid}>
            {/* 1분 단위 */}
            <div className={styles.typeCard}>
              <h4>minuteStep=1</h4>
              <p>{t('minuteStep.step1')}</p>
              <DatePicker
                type="time"
                value={minuteStep1}
                onChange={setMinuteStep1}
                minuteStep={1}
              />
              <div className={styles.selectedValue}>
                {formatTimeDisplay(minuteStep1)}
              </div>
            </div>

            {/* 5분 단위 */}
            <div className={styles.typeCard}>
              <h4>minuteStep=5</h4>
              <p>{t('minuteStep.step5')}</p>
              <DatePicker
                type="time"
                value={minuteStep5}
                onChange={setMinuteStep5}
                minuteStep={5}
              />
              <div className={styles.selectedValue}>
                {formatTimeDisplay(minuteStep5)}
              </div>
            </div>

            {/* 10분 단위 */}
            <div className={styles.typeCard}>
              <h4>minuteStep=10</h4>
              <p>{t('minuteStep.step10')}</p>
              <DatePicker
                type="time"
                value={minuteStep10}
                onChange={setMinuteStep10}
                minuteStep={10}
              />
              <div className={styles.selectedValue}>
                {formatTimeDisplay(minuteStep10)}
              </div>
            </div>

            {/* 15분 단위 */}
            <div className={styles.typeCard}>
              <h4>minuteStep=15</h4>
              <p>{t('minuteStep.step15')}</p>
              <DatePicker
                type="time"
                value={minuteStep15}
                onChange={setMinuteStep15}
                minuteStep={15}
              />
              <div className={styles.selectedValue}>
                {formatTimeDisplay(minuteStep15)}
              </div>
            </div>

            {/* 20분 단위 */}
            <div className={styles.typeCard}>
              <h4>minuteStep=20</h4>
              <p>{t('minuteStep.step20')}</p>
              <DatePicker
                type="time"
                value={minuteStep20}
                onChange={setMinuteStep20}
                minuteStep={20}
              />
              <div className={styles.selectedValue}>
                {formatTimeDisplay(minuteStep20)}
              </div>
            </div>

            {/* 30분 단위 */}
            <div className={styles.typeCard}>
              <h4>minuteStep=30</h4>
              <p>{t('minuteStep.step30')}</p>
              <DatePicker
                type="time"
                value={minuteStep30}
                onChange={setMinuteStep30}
                minuteStep={30}
              />
              <div className={styles.selectedValue}>
                {formatTimeDisplay(minuteStep30)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TSX</div>
          <pre><code>{`// 1분 단위 (기본값)
<DatePicker type="time" minuteStep={1} />

// 5분 단위
<DatePicker type="time" minuteStep={5} />

// 10분 단위
<DatePicker type="time" minuteStep={10} />

// 15분 단위
<DatePicker type="time" minuteStep={15} />

// 20분 단위
<DatePicker type="time" minuteStep={20} />

// 30분 단위
<DatePicker type="time" minuteStep={30} />

// datetime과 함께 사용
<DatePicker type="datetime" minuteStep={15} />`}</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// 분 단위 선택 타입
type MinuteStep = 1 | 5 | 10 | 15 | 20 | 30;`}</code></pre>
        </div>
      </section>

      {/* CDN Usage */}
      <section className={styles.section}>
        <h2>{t('cdn.title')}</h2>
        <p>{t('cdn.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('cdn.basicUsage')}</div>
          <pre><code>{`<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.css">

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.js"></script>

<!-- HTML -->
<div id="my-datepicker"></div>

<!-- Initialize -->
<script>
  const picker = new PodoDatePicker('#my-datepicker', {
    mode: 'instant',
    type: 'date',
    onChange: function(value) {
      console.log('Selected:', value);
    }
  });
</script>`}</code></pre>
        </div>

        <p className={styles.note}>{t('cdn.jsDelivrNote')}</p>

        <h3>{t('cdn.optionsTitle')}</h3>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>JavaScript</div>
          <pre><code>{`const picker = new PodoDatePicker('#my-datepicker', {
  // 선택 모드: 'instant' (단일) 또는 'period' (기간)
  mode: 'instant',

  // 값 타입: 'date', 'time', 'datetime'
  type: 'date',

  // 초기값
  value: {
    date: new Date(),
    time: { hour: 9, minute: 0 }
  },

  // 값 변경 콜백
  onChange: function(value) {
    console.log(value);
  },

  // 비활성화
  disabled: false,

  // 드롭다운 정렬: 'left' 또는 'right'
  align: 'left',

  // 하단 버튼 표시 (period 모드에서 기본 true)
  showActions: true,

  // 분 단위: 1, 5, 10, 15, 20, 30
  minuteStep: 15,

  // 최소/최대 날짜
  minDate: new Date(),
  maxDate: new Date(2025, 11, 31),

  // 또는 시간 포함
  minDate: {
    date: new Date(),
    time: { hour: 9, minute: 0 }
  },

  // 날짜 비활성화 조건
  disable: [
    new Date(2024, 0, 1),  // 특정 날짜
    { from: new Date(2024, 0, 10), to: new Date(2024, 0, 20) },  // 범위
    function(date) { return date.getDay() === 0; }  // 일요일
  ],

  // 특정 날짜만 활성화
  enable: [
    { from: new Date(2024, 0, 1), to: new Date(2024, 0, 15) }
  ]
});`}</code></pre>
        </div>

        <h3>{t('cdn.methodsTitle')}</h3>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>JavaScript</div>
          <pre><code>{`// ${t('cdn.getValue')}
const value = picker.getValue();
// { date: Date, time: { hour: 9, minute: 0 }, endDate: Date, endTime: {...} }

// ${t('cdn.setValue')}
picker.setValue({
  date: new Date(2024, 5, 15),
  time: { hour: 14, minute: 30 }
});

// ${t('cdn.clear')}
picker.clear();

// ${t('cdn.enable')}
picker.enable();

// ${t('cdn.disable')}
picker.disable();

// ${t('cdn.destroy')}
picker.destroy();`}</code></pre>
        </div>

        <h3>{t('cdn.localizationTitle')}</h3>
        <p>{t('cdn.localizationDesc')}</p>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>JavaScript</div>
          <pre><code>{`const picker = new PodoDatePicker('#my-datepicker', {
  type: 'date',
  texts: {
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    yearSuffix: '',  // 년 -> 빈 문자열
    reset: 'Reset',
    apply: 'Apply'
  }
});`}</code></pre>
        </div>
      </section>
    </>
  );
}
