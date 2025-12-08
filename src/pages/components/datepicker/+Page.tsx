import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker, { DatePickerValue, TimeValue } from '../../../../react/molecule/datepicker';
import styles from './Page.module.scss';

// Vanilla JS DatePicker 타입
interface VanillaDatePickerValue {
  date?: Date;
  time?: { hour: number; minute: number };
  endDate?: Date;
  endTime?: { hour: number; minute: number };
}

interface VanillaDatePickerClass {
  new (container: HTMLElement, options: Record<string, unknown>): unknown;
}

declare global {
  interface Window {
    PodoDatePicker: VanillaDatePickerClass;
  }
}

export default function DatePickerPage() {
  const { t } = useTranslation('datepicker');

  // Vanilla JS DatePicker refs
  const vanillaInstantRef = useRef<HTMLDivElement>(null);
  const vanillaPeriodRef = useRef<HTMLDivElement>(null);
  const vanillaDatetimeRef = useRef<HTMLDivElement>(null);
  const [vanillaLoaded, setVanillaLoaded] = useState(false);
  const [vanillaInstantValue, setVanillaInstantValue] = useState<string>('-');
  const [vanillaPeriodValue, setVanillaPeriodValue] = useState<string>('-');
  const [vanillaDatetimeValue, setVanillaDatetimeValue] = useState<string>('-');

  // Vanilla JS DatePicker 로드 및 초기화
  useEffect(() => {
    // CSS 로드
    if (!document.getElementById('podo-datepicker-css')) {
      const link = document.createElement('link');
      link.id = 'podo-datepicker-css';
      link.rel = 'stylesheet';
      link.href = '/vanilla/datepicker.css';
      document.head.appendChild(link);
    }

    // JS 로드
    if (!document.getElementById('podo-datepicker-js')) {
      const script = document.createElement('script');
      script.id = 'podo-datepicker-js';
      script.src = '/vanilla/datepicker.js';
      script.onload = () => {
        setVanillaLoaded(true);
      };
      document.body.appendChild(script);
    } else if (window.PodoDatePicker) {
      setVanillaLoaded(true);
    }
  }, []);

  // Vanilla DatePicker 인스턴스 초기화
  useEffect(() => {
    if (!vanillaLoaded || !window.PodoDatePicker) return;

    const formatValue = (value: VanillaDatePickerValue): string => {
      if (!value.date) return '-';
      const formatDate = (d: Date) => d.toLocaleDateString('ko-KR');
      const formatTime = (time?: { hour: number; minute: number }) =>
        time ? `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}` : '';

      let result = formatDate(value.date);
      if (value.time) result += ` ${formatTime(value.time)}`;
      if (value.endDate) {
        result += ` ~ ${formatDate(value.endDate)}`;
        if (value.endTime) result += ` ${formatTime(value.endTime)}`;
      }
      return result;
    };

    // Instant Date
    if (vanillaInstantRef.current && !vanillaInstantRef.current.hasChildNodes()) {
      new window.PodoDatePicker(vanillaInstantRef.current, {
        mode: 'instant',
        type: 'date',
        onChange: (value: VanillaDatePickerValue) => setVanillaInstantValue(formatValue(value)),
      });
    }

    // Period Date
    if (vanillaPeriodRef.current && !vanillaPeriodRef.current.hasChildNodes()) {
      new window.PodoDatePicker(vanillaPeriodRef.current, {
        mode: 'period',
        type: 'date',
        onChange: (value: VanillaDatePickerValue) => setVanillaPeriodValue(formatValue(value)),
      });
    }

    // DateTime
    if (vanillaDatetimeRef.current && !vanillaDatetimeRef.current.hasChildNodes()) {
      new window.PodoDatePicker(vanillaDatetimeRef.current, {
        mode: 'instant',
        type: 'datetime',
        minuteStep: 15,
        onChange: (value: VanillaDatePickerValue) => setVanillaDatetimeValue(formatValue(value)),
      });
    }
  }, [vanillaLoaded]);

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

  // Format demo states
  const [formatDash, setFormatDash] = useState<DatePickerValue>({});
  const [formatDot, setFormatDot] = useState<DatePickerValue>({});
  const [formatKorean, setFormatKorean] = useState<DatePickerValue>({});
  const [formatDatetime, setFormatDatetime] = useState<DatePickerValue>({});

  // Initial Calendar demo states
  const [initialPrevNow, setInitialPrevNow] = useState<DatePickerValue>({});
  const [initialNowNext, setInitialNowNext] = useState<DatePickerValue>({});
  const [initialCustom, setInitialCustom] = useState<DatePickerValue>({});

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

// ${t('code.singleDateSelect')}
<DatePicker
  mode="instant"
  type="date"
  value={value}
  onChange={setValue}
/>

// ${t('code.periodSelect')}
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
          <pre><code>{`// ${t('code.dateOnlySelect')}
<DatePicker type="date" />

// ${t('code.timeOnlySelect')}
<DatePicker type="time" />

// ${t('code.dateTimeSelect')}
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
          <pre><code>{`// ${t('code.periodDateSelect')}
<DatePicker mode="period" type="date" />

// ${t('code.periodTimeSelect')}
<DatePicker mode="period" type="time" />

// ${t('code.periodDateTimeSelect')}
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
          <pre><code>{`// ${t('code.defaultState')}
<DatePicker type="date" />

// ${t('code.disabledState')}
<DatePicker type="date" disabled />

// ${t('code.initialValue')}
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
            <tr>
              <td><code>format</code></td>
              <td><code>string</code></td>
              <td><code>-</code></td>
              <td>{t('props.format')}</td>
            </tr>
            <tr>
              <td><code>initialCalendar</code></td>
              <td><code>{`{ start?: CalendarInitial, end?: CalendarInitial }`}</code></td>
              <td><code>-</code></td>
              <td>{t('props.initialCalendar')}</td>
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
          <pre><code>{`// ${t('code.timeValueInterface')}
interface TimeValue {
  hour: number;   // 0-23
  minute: number; // 0-59
}

// ${t('code.datepickerValueInterface')}
interface DatePickerValue {
  date?: Date;        // ${t('code.startDate')}
  time?: TimeValue;   // ${t('code.startTime')}
  endDate?: Date;     // ${t('code.endDatePeriod')}
  endTime?: TimeValue; // ${t('code.endTimePeriod')}
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
          <pre><code>{`// ${t('code.dateOnlySelect')} (type="date")
const dateValue: DatePickerValue = {
  date: new Date(2024, 0, 15), // 2024-01-15
};

// ${t('code.timeOnlySelect')} (type="time")
const timeValue: DatePickerValue = {
  time: { hour: 14, minute: 30 }, // 14:30
};

// ${t('code.dateTimeSelect')} (type="datetime")
const datetimeValue: DatePickerValue = {
  date: new Date(2024, 0, 15),
  time: { hour: 14, minute: 30 },
};

// ${t('code.periodSelect')} (mode="period", type="date")
const periodValue: DatePickerValue = {
  date: new Date(2024, 0, 15),    // start
  endDate: new Date(2024, 0, 20), // end
};

// ${t('code.periodDateTimeSelect')} (mode="period", type="datetime")
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
          <pre><code>{`// ${t('code.specificDateDisable')}
<DatePicker
  type="date"
  disable={[
    new Date(2024, 0, 10), // 2024-01-10
    new Date(2024, 0, 15), // 2024-01-15
  ]}
/>

// ${t('code.dateRangeDisable')}
<DatePicker
  type="date"
  disable={[
    { from: new Date(2024, 0, 5), to: new Date(2024, 0, 12) },
  ]}
/>

// ${t('code.functionDisable')}
<DatePicker
  type="date"
  disable={[
    (date) => date.getDay() === 0 || date.getDay() === 6,
  ]}
/>

// ${t('code.specificDateEnable')}
<DatePicker
  type="date"
  enable={[
    { from: new Date(2024, 0, 1), to: new Date(2024, 0, 7) },
  ]}
/>`}</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// ${t('code.dateRangeInterface')}
interface DateRange {
  from: Date;
  to: Date;
}

// ${t('code.dateConditionType')}
type DateCondition =
  | Date                        // ${t('code.specificDate')}
  | DateRange                   // ${t('code.dateRange')}
  | ((date: Date) => boolean);  // ${t('code.conditionFunction')}`}</code></pre>
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
          <pre><code>{`// ${t('code.dateOnlyLimit')}
<DatePicker
  type="date"
  minDate={new Date()}                    // ${t('code.todayFrom')}
  maxDate={new Date(2024, 11, 31)}        // ${t('code.until')} 2024-12-31
/>

// ${t('code.dateTimeLimitComment')}
<DatePicker
  type="datetime"
  minDate={{
    date: new Date(),
    time: { hour: 9, minute: 0 },        // ${t('code.todayFrom')} 09:00
  }}
  maxDate={{
    date: new Date(2024, 11, 31),
    time: { hour: 18, minute: 0 },       // ${t('code.until')} 2024-12-31 18:00
  }}
/>`}</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// ${t('code.dateTimeLimitInterface')}
interface DateTimeLimit {
  date: Date;
  time?: TimeValue; // { hour: number, minute: number }
}

// ${t('code.minMaxDateType')}
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
          <pre><code>{`// ${t('code.minuteStepDefault')}
<DatePicker type="time" minuteStep={1} />

// ${t('code.minuteStep5')}
<DatePicker type="time" minuteStep={5} />

// ${t('code.minuteStep10')}
<DatePicker type="time" minuteStep={10} />

// ${t('code.minuteStep15')}
<DatePicker type="time" minuteStep={15} />

// ${t('code.minuteStep20')}
<DatePicker type="time" minuteStep={20} />

// ${t('code.minuteStep30')}
<DatePicker type="time" minuteStep={30} />

// ${t('code.withDatetime')}
<DatePicker type="datetime" minuteStep={15} />`}</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// ${t('code.minuteStepType')}
type MinuteStep = 1 | 5 | 10 | 15 | 20 | 30;`}</code></pre>
        </div>
      </section>

      {/* Format */}
      <section className={styles.section}>
        <h2>{t('format.title')}</h2>
        <p>{t('format.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('format.demoTitle')}</div>
          <div className={styles.typeGrid}>
            {/* Dash format */}
            <div className={styles.typeCard}>
              <h4>format=&quot;y-m-d&quot;</h4>
              <p>{t('format.dash')}</p>
              <DatePicker
                type="date"
                format="y-m-d"
                value={formatDash}
                onChange={setFormatDash}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(formatDash)}
              </div>
            </div>

            {/* Dot format */}
            <div className={styles.typeCard}>
              <h4>format=&quot;y.m.d&quot;</h4>
              <p>{t('format.dot')}</p>
              <DatePicker
                type="date"
                format="y.m.d"
                value={formatDot}
                onChange={setFormatDot}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(formatDot)}
              </div>
            </div>

            {/* Korean format */}
            <div className={styles.typeCard}>
              <h4>format=&quot;y년 m월 d일&quot;</h4>
              <p>{t('format.korean')}</p>
              <DatePicker
                type="date"
                format="y년 m월 d일"
                value={formatKorean}
                onChange={setFormatKorean}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(formatKorean)}
              </div>
            </div>

            {/* DateTime format */}
            <div className={styles.typeCard}>
              <h4>format=&quot;y.m.d h:i&quot;</h4>
              <p>{t('format.datetime')}</p>
              <DatePicker
                type="datetime"
                format="y.m.d h:i"
                value={formatDatetime}
                onChange={setFormatDatetime}
              />
              <div className={styles.selectedValue}>
                {formatDateTimeDisplay(formatDatetime)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TSX</div>
          <pre><code>{`// ${t('code.dashSeparator')}
<DatePicker type="date" format="y-m-d" />

// ${t('code.dotSeparator')}
<DatePicker type="date" format="y.m.d" />

// ${t('code.koreanFormat')}
<DatePicker type="date" format="y년 m월 d일" />

// ${t('code.datetimeFormat')}
<DatePicker type="datetime" format="y.m.d h:i" />

// ${t('code.koreanDatetimeFormat')}
<DatePicker type="datetime" format="y년 m월 d일 h시 i분" />`}</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// ${t('code.formatKey')}
// y: ${t('code.formatYear')}
// m: ${t('code.formatMonth')}
// d: ${t('code.formatDay')}
// h: ${t('code.formatHour')}
// i: ${t('code.formatMinute')}`}</code></pre>
        </div>
      </section>

      {/* Initial Calendar */}
      <section className={styles.section}>
        <h2>{t('initialCalendar.title')}</h2>
        <p>{t('initialCalendar.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('initialCalendar.demoTitle')}</div>
          <div className={styles.typeGrid}>
            {/* prevMonth / now */}
            <div className={styles.typeCard}>
              <h4>prevMonth / now</h4>
              <p>{t('initialCalendar.prevAndNow')}</p>
              <DatePicker
                mode="period"
                type="date"
                value={initialPrevNow}
                onChange={setInitialPrevNow}
                initialCalendar={{
                  start: 'prevMonth',
                  end: 'now',
                }}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(initialPrevNow)}
              </div>
            </div>

            {/* now / nextMonth */}
            <div className={styles.typeCard}>
              <h4>now / nextMonth</h4>
              <p>{t('initialCalendar.nowAndNext')}</p>
              <DatePicker
                mode="period"
                type="date"
                value={initialNowNext}
                onChange={setInitialNowNext}
                initialCalendar={{
                  start: 'now',
                  end: 'nextMonth',
                }}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(initialNowNext)}
              </div>
            </div>

            {/* Custom Date */}
            <div className={styles.typeCard}>
              <h4>Date</h4>
              <p>{t('initialCalendar.customDate')}</p>
              <DatePicker
                mode="period"
                type="date"
                value={initialCustom}
                onChange={setInitialCustom}
                initialCalendar={{
                  start: new Date(2024, 0, 1),
                  end: new Date(2024, 1, 1),
                }}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(initialCustom)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TSX</div>
          <pre><code>{`// ${t('code.prevCurrentMonth')}
<DatePicker
  mode="period"
  type="date"
  initialCalendar={{
    start: 'prevMonth',
    end: 'now',
  }}
/>

// ${t('code.currentNextMonth')}
<DatePicker
  mode="period"
  type="date"
  initialCalendar={{
    start: 'now',
    end: 'nextMonth',
  }}
/>

// ${t('code.specificDateSet')}
<DatePicker
  mode="period"
  type="date"
  initialCalendar={{
    start: new Date(2024, 0, 1),  // 2024-01
    end: new Date(2024, 1, 1),    // 2024-02
  }}
/>`}</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// ${t('code.initialCalendarType')}
type CalendarInitial = 'now' | 'prevMonth' | 'nextMonth' | Date;

// ${t('code.initialCalendarInterface')}
interface InitialCalendar {
  start?: CalendarInitial;  // ${t('code.leftCalendar')}
  end?: CalendarInitial;    // ${t('code.rightCalendar')}
}`}</code></pre>
        </div>
      </section>

      {/* CDN Usage */}
      <section className={styles.section}>
        <h2>{t('cdn.title')}</h2>
        <p>{t('cdn.description')}</p>

        {/* Live Demo */}
        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('cdn.liveDemo')}</div>
          <p>{t('cdn.liveDemoDesc')}</p>
          <div className={styles.typeGrid}>
            {/* Instant Date */}
            <div className={styles.typeCard}>
              <h4>{t('cdn.instantDate')}</h4>
              <div ref={vanillaInstantRef}></div>
              <div className={styles.selectedValue}>
                {vanillaInstantValue}
              </div>
            </div>

            {/* Period Date */}
            <div className={styles.typeCard}>
              <h4>{t('cdn.periodDate')}</h4>
              <div ref={vanillaPeriodRef}></div>
              <div className={styles.selectedValue}>
                {vanillaPeriodValue}
              </div>
            </div>

            {/* DateTime */}
            <div className={styles.typeCard}>
              <h4>{t('cdn.datetime')}</h4>
              <div ref={vanillaDatetimeRef}></div>
              <div className={styles.selectedValue}>
                {vanillaDatetimeValue}
              </div>
            </div>
          </div>
        </div>

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
  // ` + t('code.selectionMode') + `
  mode: 'instant',

  // ` + t('code.valueType') + `
  type: 'date',

  // ` + t('code.initialValueComment') + `
  value: {
    date: new Date(),
    time: { hour: 9, minute: 0 }
  },

  // ` + t('code.onChangeCallback') + `
  onChange: function(value) {
    console.log(value);
  },

  // ` + t('code.disabledComment') + `
  disabled: false,

  // ` + t('code.dropdownAlign') + `
  align: 'left',

  // ` + t('code.showActionsComment') + `
  showActions: true,

  // ` + t('code.minuteStepComment') + `
  minuteStep: 15,

  // ` + t('code.minMaxDateComment') + `
  minDate: new Date(),
  maxDate: new Date(2025, 11, 31),

  // ` + t('code.orWithTime') + `
  minDate: {
    date: new Date(),
    time: { hour: 9, minute: 0 }
  },

  // ` + t('code.disableConditions') + `
  disable: [
    new Date(2024, 0, 1),  // ` + t('code.specificDateCondition') + `
    { from: new Date(2024, 0, 10), to: new Date(2024, 0, 20) },  // ` + t('code.rangeCondition') + `
    function(date) { return date.getDay() === 0; }  // ` + t('code.sundayCondition') + `
  ],

  // ` + t('code.enableSpecificOnly') + `
  enable: [
    { from: new Date(2024, 0, 1), to: new Date(2024, 0, 15) }
  ],

  // ` + t('code.formatComment') + `
  format: 'y-m-d',  // ` + t('code.formatExample') + ` 2024-01-15
  // format: 'y.m.d',  // ` + t('code.formatExample') + ` 2024.01.15
  // format: 'y년 m월 d일',  // ` + t('code.formatExample') + ` 2024년 01월 15일
  // format: 'y-m-d h:i',  // ` + t('code.formatExample') + ` 2024-01-15 14:30

  // ` + t('code.initialCalendarComment') + `
  initialCalendar: {
    start: 'prevMonth',  // ` + t('code.leftCalendarComment') + `
    end: 'now'           // ` + t('code.rightCalendarComment') + `
  }
  // ` + t('code.startEndValues') + `
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
