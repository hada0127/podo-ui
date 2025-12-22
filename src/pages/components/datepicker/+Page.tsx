import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker, { DatePickerValue, TimeValue } from '../../../../react/molecule/datepicker';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

// Vanilla JS DatePicker type
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

  // React states
  const [instantDate, setInstantDate] = useState<DatePickerValue>({});
  const [periodDate, setPeriodDate] = useState<DatePickerValue>({});
  const [instantTime, setInstantTime] = useState<DatePickerValue>({});
  const [periodTime, setPeriodTime] = useState<DatePickerValue>({});
  const [instantDateTime, setInstantDateTime] = useState<DatePickerValue>({});
  const [periodDateTime, setPeriodDateTime] = useState<DatePickerValue>({});
  const [minMaxDate, setMinMaxDate] = useState<DatePickerValue>({});
  const [minMaxDateTime, setMinMaxDateTime] = useState<DatePickerValue>({});
  const [statesDefault, setStatesDefault] = useState<DatePickerValue>({});
  const [statesWithValue, setStatesWithValue] = useState<DatePickerValue>({ date: new Date() });
  const [disableSpecific, setDisableSpecific] = useState<DatePickerValue>({});
  const [disableRange, setDisableRange] = useState<DatePickerValue>({});
  const [disableFunction, setDisableFunction] = useState<DatePickerValue>({});
  const [enableOnly, setEnableOnly] = useState<DatePickerValue>({});
  const [minuteStep1, setMinuteStep1] = useState<DatePickerValue>({});
  const [minuteStep5, setMinuteStep5] = useState<DatePickerValue>({});
  const [minuteStep10, setMinuteStep10] = useState<DatePickerValue>({});
  const [minuteStep15, setMinuteStep15] = useState<DatePickerValue>({});
  const [minuteStep20, setMinuteStep20] = useState<DatePickerValue>({});
  const [minuteStep30, setMinuteStep30] = useState<DatePickerValue>({});
  const [formatDash, setFormatDash] = useState<DatePickerValue>({});
  const [formatDot, setFormatDot] = useState<DatePickerValue>({});
  const [formatKorean, setFormatKorean] = useState<DatePickerValue>({});
  const [formatDatetime, setFormatDatetime] = useState<DatePickerValue>({});
  const [initialPrevNow, setInitialPrevNow] = useState<DatePickerValue>({});
  const [initialNowNext, setInitialNowNext] = useState<DatePickerValue>({});
  const [initialCustom, setInitialCustom] = useState<DatePickerValue>({});
  const [yearRangeOnly, setYearRangeOnly] = useState<DatePickerValue>({});
  const [yearRangeWithMinMax, setYearRangeWithMinMax] = useState<DatePickerValue>({});
  const [yearRangePartial, setYearRangePartial] = useState<DatePickerValue>({});

  // Vanilla JS DatePicker refs
  const vanillaInstantRef = useRef<HTMLDivElement>(null);
  const vanillaPeriodRef = useRef<HTMLDivElement>(null);
  const vanillaDatetimeRef = useRef<HTMLDivElement>(null);
  const vanillaPeriodDatetimeRef = useRef<HTMLDivElement>(null);
  const [vanillaLoaded, setVanillaLoaded] = useState(false);
  const [vanillaInstantValue, setVanillaInstantValue] = useState<string>('-');
  const [vanillaPeriodValue, setVanillaPeriodValue] = useState<string>('-');
  const [vanillaDatetimeValue, setVanillaDatetimeValue] = useState<string>('-');
  const [vanillaPeriodDatetimeValue, setVanillaPeriodDatetimeValue] = useState<string>('-');

  // Vanilla JS DatePicker load and initialization
  useEffect(() => {
    if (!document.getElementById('podo-datepicker-css')) {
      const link = document.createElement('link');
      link.id = 'podo-datepicker-css';
      link.rel = 'stylesheet';
      link.href = '/vanilla/datepicker.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('podo-datepicker-js')) {
      const script = document.createElement('script');
      script.id = 'podo-datepicker-js';
      script.src = '/vanilla/datepicker.js';
      script.onload = () => setVanillaLoaded(true);
      document.body.appendChild(script);
    } else if (window.PodoDatePicker) {
      setVanillaLoaded(true);
    }
  }, []);

  // Removed: Vanilla DatePicker initialization moved to CdnContent component

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

      <DocTabs
        tabs={[
          {
            key: 'react',
            label: 'React',
            content: (
              <ReactContent
                t={t}
                instantDate={instantDate}
                setInstantDate={setInstantDate}
                periodDate={periodDate}
                setPeriodDate={setPeriodDate}
                instantTime={instantTime}
                setInstantTime={setInstantTime}
                periodTime={periodTime}
                setPeriodTime={setPeriodTime}
                instantDateTime={instantDateTime}
                setInstantDateTime={setInstantDateTime}
                periodDateTime={periodDateTime}
                setPeriodDateTime={setPeriodDateTime}
                minMaxDate={minMaxDate}
                setMinMaxDate={setMinMaxDate}
                minMaxDateTime={minMaxDateTime}
                setMinMaxDateTime={setMinMaxDateTime}
                statesDefault={statesDefault}
                setStatesDefault={setStatesDefault}
                statesWithValue={statesWithValue}
                setStatesWithValue={setStatesWithValue}
                disableSpecific={disableSpecific}
                setDisableSpecific={setDisableSpecific}
                disableRange={disableRange}
                setDisableRange={setDisableRange}
                disableFunction={disableFunction}
                setDisableFunction={setDisableFunction}
                enableOnly={enableOnly}
                setEnableOnly={setEnableOnly}
                minuteStep1={minuteStep1}
                setMinuteStep1={setMinuteStep1}
                minuteStep5={minuteStep5}
                setMinuteStep5={setMinuteStep5}
                minuteStep10={minuteStep10}
                setMinuteStep10={setMinuteStep10}
                minuteStep15={minuteStep15}
                setMinuteStep15={setMinuteStep15}
                minuteStep20={minuteStep20}
                setMinuteStep20={setMinuteStep20}
                minuteStep30={minuteStep30}
                setMinuteStep30={setMinuteStep30}
                formatDash={formatDash}
                setFormatDash={setFormatDash}
                formatDot={formatDot}
                setFormatDot={setFormatDot}
                formatKorean={formatKorean}
                setFormatKorean={setFormatKorean}
                formatDatetime={formatDatetime}
                setFormatDatetime={setFormatDatetime}
                initialPrevNow={initialPrevNow}
                setInitialPrevNow={setInitialPrevNow}
                initialNowNext={initialNowNext}
                setInitialNowNext={setInitialNowNext}
                initialCustom={initialCustom}
                setInitialCustom={setInitialCustom}
                yearRangeOnly={yearRangeOnly}
                setYearRangeOnly={setYearRangeOnly}
                yearRangeWithMinMax={yearRangeWithMinMax}
                setYearRangeWithMinMax={setYearRangeWithMinMax}
                yearRangePartial={yearRangePartial}
                setYearRangePartial={setYearRangePartial}
                formatDateDisplay={formatDateDisplay}
                formatTimeDisplay={formatTimeDisplay}
                formatDateTimeDisplay={formatDateTimeDisplay}
              />
            ),
          },
          {
            key: 'svelte',
            label: 'Svelte',
            content: <SvelteContent t={t} />,
          },
          {
            key: 'cdn',
            label: 'CDN',
            content: (
              <CdnContent
                t={t}
                vanillaInstantRef={vanillaInstantRef}
                vanillaPeriodRef={vanillaPeriodRef}
                vanillaDatetimeRef={vanillaDatetimeRef}
                vanillaPeriodDatetimeRef={vanillaPeriodDatetimeRef}
                vanillaInstantValue={vanillaInstantValue}
                vanillaPeriodValue={vanillaPeriodValue}
                vanillaDatetimeValue={vanillaDatetimeValue}
                vanillaPeriodDatetimeValue={vanillaPeriodDatetimeValue}
                onInstantChange={setVanillaInstantValue}
                onPeriodChange={setVanillaPeriodValue}
                onDatetimeChange={setVanillaDatetimeValue}
                onPeriodDatetimeChange={setVanillaPeriodDatetimeValue}
              />
            ),
          },
        ]}
        defaultTab="react"
      />
    </>
  );
}

function SvelteContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="typescript"
          code={`import { DatePicker } from 'podo-ui/svelte';`}
        />
      </section>

      <section>
        <h2>Props</h2>
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
              <td><code>'instant' | 'period'</code></td>
              <td><code>'instant'</code></td>
              <td>{t('props.mode')}</td>
            </tr>
            <tr>
              <td><code>type</code></td>
              <td><code>'date' | 'time' | 'datetime'</code></td>
              <td><code>'date'</code></td>
              <td>{t('props.type')}</td>
            </tr>
            <tr>
              <td><code>value</code></td>
              <td><code>DatePickerValue</code></td>
              <td>-</td>
              <td>{t('props.value')}</td>
            </tr>
            <tr>
              <td><code>onchange</code></td>
              <td><code>(value) =&gt; void</code></td>
              <td>-</td>
              <td>{t('props.onChange')}</td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('props.placeholder')}</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('props.disabled')}</td>
            </tr>
            <tr>
              <td><code>disable</code></td>
              <td><code>DateCondition[]</code></td>
              <td>-</td>
              <td>{t('props.disable')}</td>
            </tr>
            <tr>
              <td><code>enable</code></td>
              <td><code>DateCondition[]</code></td>
              <td>-</td>
              <td>{t('props.enable')}</td>
            </tr>
            <tr>
              <td><code>minDate</code></td>
              <td><code>Date | DateTimeLimit</code></td>
              <td>-</td>
              <td>{t('props.minDate')}</td>
            </tr>
            <tr>
              <td><code>maxDate</code></td>
              <td><code>Date | DateTimeLimit</code></td>
              <td>-</td>
              <td>{t('props.maxDate')}</td>
            </tr>
            <tr>
              <td><code>yearRange</code></td>
              <td><code>YearRange</code></td>
              <td>-</td>
              <td>{t('props.yearRange')}</td>
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
              <td>-</td>
              <td>{t('props.format')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { DatePicker } from 'podo-ui/svelte';
  import type { DatePickerValue } from 'podo-ui/svelte';

  let instantDate = $state<DatePickerValue>({});
  let periodDate = $state<DatePickerValue>({});
</script>

<!-- Single date select -->
<DatePicker
  mode="instant"
  type="date"
  bind:value={instantDate}
/>

<!-- Period select -->
<DatePicker
  mode="period"
  type="date"
  bind:value={periodDate}
/>`}
        />
      </section>

      <section>
        <h2>{t('types.title')}</h2>
        <p>{t('types.description')}</p>

        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { DatePicker } from 'podo-ui/svelte';
  import type { DatePickerValue } from 'podo-ui/svelte';

  let dateValue = $state<DatePickerValue>({});
  let timeValue = $state<DatePickerValue>({});
  let datetimeValue = $state<DatePickerValue>({});
</script>

<!-- Date only -->
<DatePicker type="date" bind:value={dateValue} />

<!-- Time only -->
<DatePicker type="time" bind:value={timeValue} />

<!-- Date and time -->
<DatePicker type="datetime" bind:value={datetimeValue} />`}
        />
      </section>

      <section>
        <h2>{t('period.title')}</h2>
        <p>{t('period.description')}</p>

        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { DatePicker } from 'podo-ui/svelte';
  import type { DatePickerValue } from 'podo-ui/svelte';

  let periodDate = $state<DatePickerValue>({});
  let periodTime = $state<DatePickerValue>({});
  let periodDatetime = $state<DatePickerValue>({});
</script>

<!-- Date range -->
<DatePicker mode="period" type="date" bind:value={periodDate} />

<!-- Time range -->
<DatePicker mode="period" type="time" bind:value={periodTime} />

<!-- Datetime range -->
<DatePicker mode="period" type="datetime" bind:value={periodDatetime} />`}
        />
      </section>

      <section>
        <h2>{t('minMax.title')}</h2>
        <p>{t('minMax.description')}</p>

        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { DatePicker } from 'podo-ui/svelte';
  import type { DatePickerValue } from 'podo-ui/svelte';

  let value = $state<DatePickerValue>({});

  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
</script>

<!-- Date only min/max -->
<DatePicker
  type="date"
  bind:value
  minDate={today}
  maxDate={thirtyDaysLater}
/>

<!-- DateTime with time limits -->
<DatePicker
  type="datetime"
  bind:value
  minDate={{ date: today, time: { hour: 9, minute: 0 } }}
  maxDate={{ date: thirtyDaysLater, time: { hour: 18, minute: 0 } }}
/>`}
        />
      </section>

      <section>
        <h2>{t('disabling.title')}</h2>
        <p>{t('disabling.description')}</p>

        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { DatePicker } from 'podo-ui/svelte';
  import type { DatePickerValue } from 'podo-ui/svelte';

  let value = $state<DatePickerValue>({});
  const now = new Date();
</script>

<!-- Disable specific dates -->
<DatePicker
  type="date"
  bind:value
  disable={[
    new Date(now.getFullYear(), now.getMonth(), 10),
    new Date(now.getFullYear(), now.getMonth(), 15),
  ]}
/>

<!-- Disable date range -->
<DatePicker
  type="date"
  bind:value
  disable={[
    {
      from: new Date(now.getFullYear(), now.getMonth(), 5),
      to: new Date(now.getFullYear(), now.getMonth(), 12),
    },
  ]}
/>

<!-- Disable weekends -->
<DatePicker
  type="date"
  bind:value
  disable={[
    (date) => date.getDay() === 0 || date.getDay() === 6,
  ]}
/>

<!-- Enable only specific dates -->
<DatePicker
  type="date"
  bind:value
  enable={[
    {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth(), 7),
    },
  ]}
/>`}
        />
      </section>

      <section>
        <h2>{t('minuteStep.title')}</h2>
        <p>{t('minuteStep.description')}</p>

        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { DatePicker } from 'podo-ui/svelte';
  import type { DatePickerValue } from 'podo-ui/svelte';

  let value1 = $state<DatePickerValue>({});
  let value15 = $state<DatePickerValue>({});
  let value30 = $state<DatePickerValue>({});
</script>

<DatePicker type="time" bind:value={value1} minuteStep={1} />
<DatePicker type="time" bind:value={value15} minuteStep={15} />
<DatePicker type="time" bind:value={value30} minuteStep={30} />`}
        />
      </section>

      <section>
        <h2>{t('format.title')}</h2>
        <p>{t('format.description')}</p>

        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { DatePicker } from 'podo-ui/svelte';
  import type { DatePickerValue } from 'podo-ui/svelte';

  let value = $state<DatePickerValue>({});
</script>

<DatePicker type="date" format="y-m-d" bind:value />
<DatePicker type="date" format="y.m.d" bind:value />
<DatePicker type="date" format="y년 m월 d일" bind:value />
<DatePicker type="datetime" format="y.m.d h:i" bind:value />`}
        />
      </section>

      <section>
        <h2>{t('yearRange.title')}</h2>
        <p>{t('yearRange.description')}</p>

        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { DatePicker } from 'podo-ui/svelte';
  import type { DatePickerValue } from 'podo-ui/svelte';

  let value = $state<DatePickerValue>({});
</script>

<!-- Explicit year range -->
<DatePicker
  type="date"
  bind:value
  yearRange={{ min: 2020, max: 2030 }}
/>

<!-- Combined with minDate/maxDate -->
<DatePicker
  type="date"
  bind:value
  yearRange={{ min: 2020, max: 2030 }}
  minDate={new Date(2023, 0, 1)}
  maxDate={new Date(2025, 11, 31)}
/>`}
        />
      </section>

      <section>
        <h2>{t('valueInterface.title')}</h2>
        <p>{t('valueInterface.description')}</p>

        <CodeBlock
          title="TypeScript"
          language="typescript"
          code={`interface TimeValue {
  hour: number;   // 0-23
  minute: number; // 0-59
}

interface DatePickerValue {
  date?: Date;        // Start date
  time?: TimeValue;   // Start time
  endDate?: Date;     // End date (period mode)
  endTime?: TimeValue; // End time (period mode)
}`}
        />
      </section>
    </>
  );
}

interface ReactContentProps {
  t: (key: string) => string;
  instantDate: DatePickerValue;
  setInstantDate: (v: DatePickerValue) => void;
  periodDate: DatePickerValue;
  setPeriodDate: (v: DatePickerValue) => void;
  instantTime: DatePickerValue;
  setInstantTime: (v: DatePickerValue) => void;
  periodTime: DatePickerValue;
  setPeriodTime: (v: DatePickerValue) => void;
  instantDateTime: DatePickerValue;
  setInstantDateTime: (v: DatePickerValue) => void;
  periodDateTime: DatePickerValue;
  setPeriodDateTime: (v: DatePickerValue) => void;
  minMaxDate: DatePickerValue;
  setMinMaxDate: (v: DatePickerValue) => void;
  minMaxDateTime: DatePickerValue;
  setMinMaxDateTime: (v: DatePickerValue) => void;
  statesDefault: DatePickerValue;
  setStatesDefault: (v: DatePickerValue) => void;
  statesWithValue: DatePickerValue;
  setStatesWithValue: (v: DatePickerValue) => void;
  disableSpecific: DatePickerValue;
  setDisableSpecific: (v: DatePickerValue) => void;
  disableRange: DatePickerValue;
  setDisableRange: (v: DatePickerValue) => void;
  disableFunction: DatePickerValue;
  setDisableFunction: (v: DatePickerValue) => void;
  enableOnly: DatePickerValue;
  setEnableOnly: (v: DatePickerValue) => void;
  minuteStep1: DatePickerValue;
  setMinuteStep1: (v: DatePickerValue) => void;
  minuteStep5: DatePickerValue;
  setMinuteStep5: (v: DatePickerValue) => void;
  minuteStep10: DatePickerValue;
  setMinuteStep10: (v: DatePickerValue) => void;
  minuteStep15: DatePickerValue;
  setMinuteStep15: (v: DatePickerValue) => void;
  minuteStep20: DatePickerValue;
  setMinuteStep20: (v: DatePickerValue) => void;
  minuteStep30: DatePickerValue;
  setMinuteStep30: (v: DatePickerValue) => void;
  formatDash: DatePickerValue;
  setFormatDash: (v: DatePickerValue) => void;
  formatDot: DatePickerValue;
  setFormatDot: (v: DatePickerValue) => void;
  formatKorean: DatePickerValue;
  setFormatKorean: (v: DatePickerValue) => void;
  formatDatetime: DatePickerValue;
  setFormatDatetime: (v: DatePickerValue) => void;
  initialPrevNow: DatePickerValue;
  setInitialPrevNow: (v: DatePickerValue) => void;
  initialNowNext: DatePickerValue;
  setInitialNowNext: (v: DatePickerValue) => void;
  initialCustom: DatePickerValue;
  setInitialCustom: (v: DatePickerValue) => void;
  yearRangeOnly: DatePickerValue;
  setYearRangeOnly: (v: DatePickerValue) => void;
  yearRangeWithMinMax: DatePickerValue;
  setYearRangeWithMinMax: (v: DatePickerValue) => void;
  yearRangePartial: DatePickerValue;
  setYearRangePartial: (v: DatePickerValue) => void;
  formatDateDisplay: (v: DatePickerValue) => string;
  formatTimeDisplay: (v: DatePickerValue) => string;
  formatDateTimeDisplay: (v: DatePickerValue) => string;
}

function ReactContent({
  t,
  instantDate,
  setInstantDate,
  periodDate,
  setPeriodDate,
  instantTime,
  setInstantTime,
  periodTime,
  setPeriodTime,
  instantDateTime,
  setInstantDateTime,
  periodDateTime,
  setPeriodDateTime,
  minMaxDate,
  setMinMaxDate,
  minMaxDateTime,
  setMinMaxDateTime,
  statesDefault,
  setStatesDefault,
  statesWithValue,
  setStatesWithValue,
  disableSpecific,
  setDisableSpecific,
  disableRange,
  setDisableRange,
  disableFunction,
  setDisableFunction,
  enableOnly,
  setEnableOnly,
  minuteStep1,
  setMinuteStep1,
  minuteStep5,
  setMinuteStep5,
  minuteStep10,
  setMinuteStep10,
  minuteStep15,
  setMinuteStep15,
  minuteStep20,
  setMinuteStep20,
  minuteStep30,
  setMinuteStep30,
  formatDash,
  setFormatDash,
  formatDot,
  setFormatDot,
  formatKorean,
  setFormatKorean,
  formatDatetime,
  setFormatDatetime,
  initialPrevNow,
  setInitialPrevNow,
  initialNowNext,
  setInitialNowNext,
  initialCustom,
  setInitialCustom,
  yearRangeOnly,
  setYearRangeOnly,
  yearRangeWithMinMax,
  setYearRangeWithMinMax,
  yearRangePartial,
  setYearRangePartial,
  formatDateDisplay,
  formatTimeDisplay,
  formatDateTimeDisplay,
}: ReactContentProps) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { DatePicker } from 'podo-ui';`} />
      </section>

      <section>
        <h2>Props</h2>
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
              <td><code>'instant' | 'period'</code></td>
              <td><code>'instant'</code></td>
              <td>{t('props.mode')}</td>
            </tr>
            <tr>
              <td><code>type</code></td>
              <td><code>'date' | 'time' | 'datetime'</code></td>
              <td><code>'date'</code></td>
              <td>{t('props.type')}</td>
            </tr>
            <tr>
              <td><code>value</code></td>
              <td><code>DatePickerValue</code></td>
              <td>-</td>
              <td>{t('props.value')}</td>
            </tr>
            <tr>
              <td><code>onChange</code></td>
              <td><code>(value) =&gt; void</code></td>
              <td>-</td>
              <td>{t('props.onChange')}</td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('props.placeholder')}</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('props.disabled')}</td>
            </tr>
            <tr>
              <td><code>disable</code></td>
              <td><code>DateCondition[]</code></td>
              <td>-</td>
              <td>{t('props.disable')}</td>
            </tr>
            <tr>
              <td><code>enable</code></td>
              <td><code>DateCondition[]</code></td>
              <td>-</td>
              <td>{t('props.enable')}</td>
            </tr>
            <tr>
              <td><code>minDate</code></td>
              <td><code>Date | DateTimeLimit</code></td>
              <td>-</td>
              <td>{t('props.minDate')}</td>
            </tr>
            <tr>
              <td><code>maxDate</code></td>
              <td><code>Date | DateTimeLimit</code></td>
              <td>-</td>
              <td>{t('props.maxDate')}</td>
            </tr>
            <tr>
              <td><code>yearRange</code></td>
              <td><code>YearRange</code></td>
              <td>-</td>
              <td>{t('props.yearRange')}</td>
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
              <td>-</td>
              <td>{t('props.format')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title="React"
          language="tsx"
          code={`import { DatePicker } from 'podo-ui';

// Single date select
<DatePicker
  mode="instant"
  type="date"
  value={value}
  onChange={setValue}
/>

// Period select
<DatePicker
  mode="period"
  type="date"
  value={value}
  onChange={setValue}
/>`}
        />

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

      <section>
        <h2>{t('types.title')}</h2>
        <p>{t('types.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('types.demoTitle')}</div>
          <div className={styles.typeGrid}>
            <div className={styles.typeCard}>
              <h4>type="date"</h4>
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

            <div className={styles.typeCard}>
              <h4>type="time"</h4>
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

            <div className={styles.typeCard}>
              <h4>type="datetime"</h4>
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
      </section>

      <section>
        <h2>{t('period.title')}</h2>
        <p>{t('period.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('period.demoTitle')}</div>
          <div className={styles.typeGrid}>
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
      </section>

      <section>
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
      </section>

      <section>
        <h2>{t('disabling.title')}</h2>
        <p>{t('disabling.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('disabling.demoTitle')}</div>
          <div className={styles.typeGrid}>
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
      </section>

      <section>
        <h2>{t('minMax.title')}</h2>
        <p>{t('minMax.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('minMax.demoTitle')}</div>
          <div className={styles.typeGrid}>
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
      </section>

      <section>
        <h2>{t('yearRange.title')}</h2>
        <p>{t('yearRange.description')}</p>

        <CodeBlock
          language="tsx"
          code={`// yearRange만 사용 (명시적 지정)
<DatePicker
  yearRange={{ min: 2020, max: 2030 }}
/>

// minDate/maxDate만 사용 (년도 자동 추출)
<DatePicker
  minDate={new Date(2022, 0, 1)}
  maxDate={new Date(2025, 11, 31)}
/>

// 둘 다 사용 (yearRange 우선, 날짜 비활성화는 minDate/maxDate 적용)
<DatePicker
  yearRange={{ min: 2020, max: 2030 }}
  minDate={new Date(2022, 0, 1)}
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('yearRange.demoTitle')}</div>
          <div className={styles.typeGrid}>
            <div className={styles.typeCard}>
              <h4>{t('yearRange.onlyYearRange')}</h4>
              <p>{t('yearRange.onlyYearRangeDesc')}</p>
              <DatePicker
                type="date"
                value={yearRangeOnly}
                onChange={setYearRangeOnly}
                yearRange={{ min: 2020, max: 2030 }}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(yearRangeOnly)}
              </div>
            </div>

            <div className={styles.typeCard}>
              <h4>{t('yearRange.withMinMax')}</h4>
              <p>{t('yearRange.withMinMaxDesc')}</p>
              <DatePicker
                type="date"
                value={yearRangeWithMinMax}
                onChange={setYearRangeWithMinMax}
                yearRange={{ min: 2020, max: 2030 }}
                minDate={new Date(2023, 0, 1)}
                maxDate={new Date(2025, 11, 31)}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(yearRangeWithMinMax)}
              </div>
            </div>

            <div className={styles.typeCard}>
              <h4>{t('yearRange.partial')}</h4>
              <p>{t('yearRange.partialDesc')}</p>
              <DatePicker
                type="date"
                value={yearRangePartial}
                onChange={setYearRangePartial}
                yearRange={{ min: 2000 }}
                maxDate={new Date(2025, 11, 31)}
              />
              <div className={styles.selectedValue}>
                {formatDateDisplay(yearRangePartial)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('minuteStep.title')}</h2>
        <p>{t('minuteStep.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('minuteStep.demoTitle')}</div>
          <div className={styles.typeGrid}>
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
      </section>

      <section>
        <h2>{t('format.title')}</h2>
        <p>{t('format.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('format.demoTitle')}</div>
          <div className={styles.typeGrid}>
            <div className={styles.typeCard}>
              <h4>format="y-m-d"</h4>
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

            <div className={styles.typeCard}>
              <h4>format="y.m.d"</h4>
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

            <div className={styles.typeCard}>
              <h4>format="y년 m월 d일"</h4>
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

            <div className={styles.typeCard}>
              <h4>format="y.m.d h:i"</h4>
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
      </section>

      <section>
        <h2>{t('initialCalendar.title')}</h2>
        <p>{t('initialCalendar.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('initialCalendar.demoTitle')}</div>
          <div className={styles.typeGrid}>
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
      </section>

      <section>
        <h2>{t('valueInterface.title')}</h2>
        <p>{t('valueInterface.description')}</p>

        <CodeBlock
          title="TypeScript"
          language="typescript"
          code={`interface TimeValue {
  hour: number;   // 0-23
  minute: number; // 0-59
}

interface DatePickerValue {
  date?: Date;        // Start date
  time?: TimeValue;   // Start time
  endDate?: Date;     // End date (period mode)
  endTime?: TimeValue; // End time (period mode)
}`}
        />
      </section>
    </>
  );
}

interface CdnContentProps {
  t: (key: string) => string;
  vanillaInstantRef: React.RefObject<HTMLDivElement>;
  vanillaPeriodRef: React.RefObject<HTMLDivElement>;
  vanillaDatetimeRef: React.RefObject<HTMLDivElement>;
  vanillaPeriodDatetimeRef: React.RefObject<HTMLDivElement>;
  vanillaInstantValue: string;
  vanillaPeriodValue: string;
  vanillaDatetimeValue: string;
  vanillaPeriodDatetimeValue: string;
  onInstantChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onDatetimeChange: (value: string) => void;
  onPeriodDatetimeChange: (value: string) => void;
}

function CdnContent({
  t,
  vanillaInstantRef,
  vanillaPeriodRef,
  vanillaDatetimeRef,
  vanillaPeriodDatetimeRef,
  vanillaInstantValue,
  vanillaPeriodValue,
  vanillaDatetimeValue,
  vanillaPeriodDatetimeValue,
  onInstantChange,
  onPeriodChange,
  onDatetimeChange,
  onPeriodDatetimeChange,
}: CdnContentProps) {
  // Initialize Vanilla DatePickers when CDN tab is mounted
  useEffect(() => {
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

    // Format value for datetime types - always show time even if 00:00
    const formatDatetimeValue = (value: VanillaDatePickerValue): string => {
      if (!value.date) return '-';
      const formatDate = (d: Date) => d.toLocaleDateString('ko-KR');
      const formatTime = (time?: { hour: number; minute: number }) =>
        time ? `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}` : '00:00';

      let result = formatDate(value.date);
      result += ` ${formatTime(value.time)}`;
      if (value.endDate) {
        result += ` ~ ${formatDate(value.endDate)}`;
        result += ` ${formatTime(value.endTime)}`;
      }
      return result;
    };

    // Wait for PodoDatePicker script to load before initializing
    const initializePickers = () => {
      if (!window.PodoDatePicker) return false;

      // Only initialize if containers are empty
      if (vanillaInstantRef.current && !vanillaInstantRef.current.hasChildNodes()) {
        new window.PodoDatePicker(vanillaInstantRef.current, {
          mode: 'instant',
          type: 'date',
          onChange: (value: VanillaDatePickerValue) => onInstantChange(formatValue(value)),
        });
      }

      if (vanillaPeriodRef.current && !vanillaPeriodRef.current.hasChildNodes()) {
        new window.PodoDatePicker(vanillaPeriodRef.current, {
          mode: 'period',
          type: 'date',
          onChange: (value: VanillaDatePickerValue) => onPeriodChange(formatValue(value)),
        });
      }

      if (vanillaDatetimeRef.current && !vanillaDatetimeRef.current.hasChildNodes()) {
        new window.PodoDatePicker(vanillaDatetimeRef.current, {
          mode: 'instant',
          type: 'datetime',
          minuteStep: 15,
          onChange: (value: VanillaDatePickerValue) => onDatetimeChange(formatDatetimeValue(value)),
        });
      }

      if (vanillaPeriodDatetimeRef.current && !vanillaPeriodDatetimeRef.current.hasChildNodes()) {
        new window.PodoDatePicker(vanillaPeriodDatetimeRef.current, {
          mode: 'period',
          type: 'datetime',
          minuteStep: 15,
          onChange: (value: VanillaDatePickerValue) => {
            console.log('Period DateTime onChange:', value);
            onPeriodDatetimeChange(formatDatetimeValue(value));
          },
        });
      }

      return true;
    };

    // Try to initialize immediately, or wait for script to load
    if (!initializePickers()) {
      const interval = setInterval(() => {
        if (initializePickers()) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [vanillaInstantRef, vanillaPeriodRef, vanillaDatetimeRef, vanillaPeriodDatetimeRef, onInstantChange, onPeriodChange, onDatetimeChange, onPeriodDatetimeChange]);

  return (
    <>
      <section>
        <h2>CDN Links</h2>
        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.css">

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.js"></script>`}
        />
      </section>

      <section>
        <h2>{t('cdn.title')}</h2>
        <p>{t('cdn.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- HTML -->
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
</script>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('cdn.liveDemo')}</div>
          <p>{t('cdn.liveDemoDesc')}</p>
          <div className={styles.typeGrid}>
            <div className={styles.typeCard}>
              <h4>{t('cdn.instantDate')}</h4>
              <div ref={vanillaInstantRef}></div>
              <div className={styles.selectedValue}>
                {vanillaInstantValue}
              </div>
            </div>

            <div className={styles.typeCard}>
              <h4>{t('cdn.periodDate')}</h4>
              <div ref={vanillaPeriodRef}></div>
              <div className={styles.selectedValue}>
                {vanillaPeriodValue}
              </div>
            </div>

            <div className={styles.typeCard}>
              <h4>{t('cdn.datetime')}</h4>
              <div ref={vanillaDatetimeRef}></div>
              <div className={styles.selectedValue}>
                {vanillaDatetimeValue}
              </div>
            </div>

            <div className={styles.typeCard}>
              <h4>{t('cdn.periodDatetime')}</h4>
              <div ref={vanillaPeriodDatetimeRef}></div>
              <div className={styles.selectedValue}>
                {vanillaPeriodDatetimeValue}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('cdn.optionsTitle')}</h2>
        <CodeBlock
          title="JavaScript"
          language="javascript"
          code={`const picker = new PodoDatePicker('#my-datepicker', {
  mode: 'instant',        // 'instant' | 'period'
  type: 'date',           // 'date' | 'time' | 'datetime'

  value: {
    date: new Date(),
    time: { hour: 9, minute: 0 }
  },

  onChange: function(value) {
    console.log(value);
  },

  disabled: false,
  align: 'left',          // 'left' | 'right'
  showActions: true,
  minuteStep: 15,         // 1 | 5 | 10 | 15 | 20 | 30

  minDate: new Date(),
  maxDate: new Date(2025, 11, 31),

  disable: [
    new Date(2024, 0, 1),
    { from: new Date(2024, 0, 10), to: new Date(2024, 0, 20) },
    function(date) { return date.getDay() === 0; }
  ],

  enable: [
    { from: new Date(2024, 0, 1), to: new Date(2024, 0, 15) }
  ],

  format: 'y-m-d',

  initialCalendar: {
    start: 'prevMonth',
    end: 'now'
  }
});`}
        />
      </section>

      <section>
        <h2>{t('cdn.methodsTitle')}</h2>
        <CodeBlock
          title="JavaScript"
          language="javascript"
          code={`// Get value
const value = picker.getValue();

// Set value
picker.setValue({
  date: new Date(2024, 5, 15),
  time: { hour: 14, minute: 30 }
});

// Clear
picker.clear();

// Enable/Disable
picker.enable();
picker.disable();

// Destroy
picker.destroy();`}
        />
      </section>

      <section>
        <h2>{t('cdn.localizationTitle')}</h2>
        <p>{t('cdn.localizationDesc')}</p>
        <CodeBlock
          title="JavaScript"
          language="javascript"
          code={`const picker = new PodoDatePicker('#my-datepicker', {
  type: 'date',
  texts: {
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    yearSuffix: '',
    reset: 'Reset',
    apply: 'Apply'
  }
});`}
        />
      </section>
    </>
  );
}
