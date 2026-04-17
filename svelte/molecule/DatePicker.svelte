<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import styles from '../../react/molecule/datepicker.module.scss';

  // Types
  export type DatePickerMode = 'instant' | 'period';
  export type DatePickerType = 'date' | 'time' | 'datetime';

  export interface TimeValue {
    hour: number;
    minute: number;
  }

  export interface DatePickerValue {
    date?: Date;
    time?: TimeValue;
    endDate?: Date;
    endTime?: TimeValue;
  }

  export interface DateRange {
    from: Date;
    to: Date;
  }

  export type DateCondition = Date | DateRange | ((date: Date) => boolean);

  export interface DateTimeLimit {
    date: Date;
    time?: TimeValue;
  }

  export type MinuteStep = 1 | 5 | 10 | 15 | 20 | 30;

  export interface YearRange {
    min?: number;
    max?: number;
  }

  export type CalendarInitial = 'now' | 'prevMonth' | 'nextMonth' | Date;

  export interface InitialCalendar {
    start?: CalendarInitial;
    end?: CalendarInitial;
  }

  /** Quick Select 프리셋 키 */
  export type QuickSelectKey =
    | 'today'
    | 'yesterday'
    | 'thisWeek'
    | 'lastWeek'
    | 'last7Days'
    | 'last30Days'
    | 'thisMonth'
    | 'lastMonth';

  // Navigation helpers
  type NavigationStep = { type: 'days'; count: number } | { type: 'month'; count: number };

  const getNavigationStepForPreset = (key: QuickSelectKey): NavigationStep => {
    switch (key) {
      case 'today': case 'yesterday': return { type: 'days', count: 1 };
      case 'thisWeek': case 'lastWeek': case 'last7Days': return { type: 'days', count: 7 };
      case 'last30Days': return { type: 'days', count: 30 };
      case 'thisMonth': case 'lastMonth': return { type: 'month', count: 1 };
    }
  };

  const calculateNavigationStep = (start: Date, end: Date): NavigationStep => {
    const diffMs = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
      - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    return { type: 'days', count: Math.round(diffMs / 86400000) + 1 };
  };

  const shiftDateRange = (start: Date, _end: Date, step: NavigationStep, dir: 1 | -1) => {
    if (step.type === 'month') {
      const shift = step.count * dir;
      const newStart = new Date(start.getFullYear(), start.getMonth() + shift, 1);
      const newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
      return { start: newStart, end: newEnd };
    }
    const shift = step.count * dir;
    const s = new Date(start); s.setDate(s.getDate() + shift);
    const e = new Date(s); e.setDate(e.getDate() + step.count - 1);
    return { start: s, end: e };
  };

  // Quick Select helpers
  interface QuickSelectPreset {
    key: QuickSelectKey;
    label: string;
  }

  const QUICK_SELECT_PRESETS: QuickSelectPreset[] = [
    { key: 'today', label: '오늘' },
    { key: 'yesterday', label: '어제' },
    { key: 'thisWeek', label: '이번 주' },
    { key: 'lastWeek', label: '지난 주' },
    { key: 'last7Days', label: '최근 7일' },
    { key: 'last30Days', label: '최근 30일' },
    { key: 'thisMonth', label: '이번 달' },
    { key: 'lastMonth', label: '지난 달' },
  ];

  const getPresetRange = (key: QuickSelectKey): { start: Date; end: Date } => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (key) {
      case 'today':
        return { start: new Date(todayStart), end: new Date(todayStart) };
      case 'yesterday': {
        const d = new Date(todayStart); d.setDate(d.getDate() - 1);
        return { start: d, end: new Date(d) };
      }
      case 'thisWeek': {
        const dow = todayStart.getDay();
        const start = new Date(todayStart); start.setDate(start.getDate() - dow);
        const end = new Date(start); end.setDate(end.getDate() + 6);
        return { start, end };
      }
      case 'lastWeek': {
        const dow = todayStart.getDay();
        const thisWeekStart = new Date(todayStart); thisWeekStart.setDate(thisWeekStart.getDate() - dow);
        const start = new Date(thisWeekStart); start.setDate(start.getDate() - 7);
        const end = new Date(start); end.setDate(end.getDate() + 6);
        return { start, end };
      }
      case 'last7Days': {
        const start = new Date(todayStart); start.setDate(start.getDate() - 6);
        return { start, end: new Date(todayStart) };
      }
      case 'last30Days': {
        const start = new Date(todayStart); start.setDate(start.getDate() - 29);
        return { start, end: new Date(todayStart) };
      }
      case 'thisMonth': {
        const start = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
        const end = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0);
        return { start, end };
      }
      case 'lastMonth': {
        const start = new Date(todayStart.getFullYear(), todayStart.getMonth() - 1, 1);
        const end = new Date(todayStart.getFullYear(), todayStart.getMonth(), 0);
        return { start, end };
      }
    }
  };

  const checkPresetDisabled = (
    key: QuickSelectKey,
    minD?: Date | DateTimeLimit,
    maxD?: Date | DateTimeLimit
  ): boolean => {
    const { start, end } = getPresetRange(key);
    if (minD) {
      const min = minD instanceof Date ? minD : minD.date;
      const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
      if (end < minDay) return true;
    }
    if (maxD) {
      const max = maxD instanceof Date ? maxD : maxD.date;
      const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
      if (start > maxDay) return true;
    }
    return false;
  };

  interface Props {
    /** Selection mode: instant | period */
    mode?: DatePickerMode;
    /** Value type: date | time | datetime */
    type?: DatePickerType;
    /** Selected value */
    value?: DatePickerValue;
    /** Value change handler */
    onchange?: (value: DatePickerValue) => void;
    /** Placeholder */
    placeholder?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Show action buttons (default true for period mode) */
    showActions?: boolean;
    /** Dropdown alignment */
    align?: 'left' | 'right';
    /** Additional class name */
    class?: string;
    /** Disabled date conditions */
    disable?: DateCondition[];
    /** Enabled date conditions (only these dates are selectable) */
    enable?: DateCondition[];
    /** Minimum selectable date */
    minDate?: Date | DateTimeLimit;
    /** Maximum selectable date */
    maxDate?: Date | DateTimeLimit;
    /** Minute selection step */
    minuteStep?: MinuteStep;
    /** Date/time format pattern */
    format?: string;
    /** Initial calendar display month for period mode */
    initialCalendar?: InitialCalendar;
    /** Year selection range */
    yearRange?: YearRange;
    /** Show quick select presets (period mode only) */
    quickSelect?: boolean;
    /** Hide left/right navigation arrows on input (even when quickSelect+period) */
    hideNavArrow?: boolean;
    /** Dropdown open direction: 'down' (default), 'up', or 'auto' (flips up when space below is insufficient) */
    direction?: 'down' | 'up' | 'auto';
    /** Reset button click callback */
    onreset?: () => void;
  }

  let {
    mode = 'instant',
    type = 'date',
    value = $bindable<DatePickerValue>({}),
    onchange,
    placeholder,
    disabled = false,
    showActions,
    align = 'left',
    class: className = '',
    disable,
    enable,
    minDate,
    maxDate,
    minuteStep = 1,
    format,
    initialCalendar,
    yearRange,
    quickSelect = false,
    hideNavArrow = false,
    direction = 'down',
    onreset,
    ...rest
  }: Props & Record<string, unknown> = $props();

  // State
  type SelectingPart = 'date' | 'hour' | 'minute' | 'endDate' | 'endHour' | 'endMinute' | null;

  let selectingPart = $state<SelectingPart>(null);
  let tempValue = $state<DatePickerValue>(value || {});
  let viewDate = $state(new Date());
  let endViewDate = $state(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));
  let containerRef = $state<HTMLDivElement | null>(null);
  let navigationStep = $state<NavigationStep | null>(
    value?.date && value?.endDate ? calculateNavigationStep(value.date, value.endDate) : null
  );
  let navigationAnchor = $state<Date | null>(value?.date ?? null);
  let activePresetKeyState = $state<QuickSelectKey | null>(null);
  let navOffset = $state(0);

  const today = new Date();

  // Computed
  const shouldShowActions = $derived(showActions ?? mode === 'period');
  const isOpen = $derived(selectingPart === 'date' || selectingPart === 'endDate');
  const displayValue = $derived(shouldShowActions ? tempValue : value);
  const hasStartValue = $derived(!!displayValue?.date);
  const hasEndValue = $derived(!!displayValue?.endDate);
  const inputIcon = $derived(type === 'time' ? 'icon-time' : 'icon-calendar');
  const showNavigation = $derived(quickSelect && mode === 'period' && !hideNavArrow);

  // 드롭다운 방향 결정 (direction='auto'일 때 공간 측정)
  let resolvedDirection = $state<'up' | 'down'>(direction === 'up' ? 'up' : 'down');
  $effect(() => {
    if (!isOpen) return;
    if (direction !== 'auto') {
      resolvedDirection = direction === 'up' ? 'up' : 'down';
      return;
    }
    if (!containerRef) return;
    requestAnimationFrame(() => {
      if (!containerRef) return;
      const rect = containerRef.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 360;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      resolvedDirection = spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'up' : 'down';
    });
  });

  const isPresetActiveCheck = (key: QuickSelectKey): boolean => {
    const dv = displayValue;
    if (!dv?.date || !dv?.endDate) return false;
    let { start, end } = getPresetRange(key);
    if (minDate) {
      const min = minDate instanceof Date ? minDate : minDate.date;
      const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
      if (start < minDay) start = minDay;
    }
    if (maxDate) {
      const max = maxDate instanceof Date ? maxDate : maxDate.date;
      const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
      if (end > maxDay) end = maxDay;
    }
    return isSameDay(dv.date, start) && isSameDay(dv.endDate, end);
  };

  const getNavOffsetLabel = (): string | null => {
    const offset = Math.abs(navOffset);
    const isFuture = navOffset > 0;
    if (!navigationStep) return null;
    if (navigationStep.type === 'month') {
      return isFuture ? `${offset}개월 후` : `${offset}개월 전`;
    }
    if (navigationStep.count === 1) {
      return isFuture ? `${offset}일 후` : `${offset}일 전`;
    }
    if (navigationStep.count === 7) {
      return isFuture ? `${offset}주 후` : `${offset}주 전`;
    }
    if (navigationStep.count === 30) {
      return isFuture ? `${offset * 30}일 후` : `${offset * 30}일 전`;
    }
    return isFuture ? `${offset * navigationStep.count}일 후` : `${offset * navigationStep.count}일 전`;
  };

  const getActivePresetLabel = (): string | null => {
    const dv = displayValue;
    if (!dv?.date || !dv?.endDate) return null;
    for (const preset of QUICK_SELECT_PRESETS) {
      if (isPresetActiveCheck(preset.key)) return preset.label;
    }
    if (activePresetKeyState && navOffset !== 0) {
      return getNavOffsetLabel();
    }
    return null;
  };

  const activePresetLabel = $derived(showNavigation ? getActivePresetLabel() : null);

  // Helper functions
  const resolveCalendarInitial = (initial: CalendarInitial | undefined, fallback: Date): Date => {
    if (!initial) return fallback;
    if (initial instanceof Date) return initial;

    const now = new Date();
    switch (initial) {
      case 'now':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'prevMonth':
        return new Date(now.getFullYear(), now.getMonth() - 1, 1);
      case 'nextMonth':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      default:
        return fallback;
    }
  };

  const formatWithPattern = (date: Date | undefined, time: TimeValue | undefined, pattern: string): string => {
    if (!date && !time) return '';

    let result = pattern;

    if (date) {
      result = result.replace(/y/g, String(date.getFullYear()));
      result = result.replace(/m/g, String(date.getMonth() + 1).padStart(2, '0'));
      result = result.replace(/d/g, String(date.getDate()).padStart(2, '0'));
    }

    if (time) {
      result = result.replace(/h/g, String(time.hour).padStart(2, '0'));
      result = result.replace(/i/g, String(time.minute).padStart(2, '0'));
    }

    return result;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isInRange = (date: Date, start: Date, end: Date): boolean => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return d >= s && d <= e;
  };

  const isInRangeExclusive = (date: Date, start: Date, end: Date): boolean => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return d > s && d < e;
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const isDateRange = (condition: DateCondition): condition is DateRange => {
    return typeof condition === 'object' && 'from' in condition && 'to' in condition;
  };

  const matchesCondition = (date: Date, condition: DateCondition): boolean => {
    if (typeof condition === 'function') {
      return condition(date);
    }
    if (isDateRange(condition)) {
      return isInRange(date, condition.from, condition.to);
    }
    return isSameDay(date, condition);
  };

  const isDateDisabled = (date: Date): boolean => {
    if (enable && enable.length > 0) {
      const isEnabled = enable.some((condition) => matchesCondition(date, condition));
      return !isEnabled;
    }

    if (disable && disable.length > 0) {
      return disable.some((condition) => matchesCondition(date, condition));
    }

    return false;
  };

  const isDateTimeLimit = (val: Date | DateTimeLimit): val is DateTimeLimit => {
    return typeof val === 'object' && 'date' in val && !(val instanceof Date);
  };

  const extractDateTimeLimit = (limit: Date | DateTimeLimit): { date: Date; time?: TimeValue } => {
    if (isDateTimeLimit(limit)) {
      return { date: limit.date, time: limit.time };
    }
    return { date: limit };
  };

  const isBeforeMinDate = (date: Date): boolean => {
    if (!minDate) return false;
    const { date: minDateValue } = extractDateTimeLimit(minDate);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const m = new Date(minDateValue.getFullYear(), minDateValue.getMonth(), minDateValue.getDate());
    return d < m;
  };

  const isAfterMaxDate = (date: Date): boolean => {
    if (!maxDate) return false;
    const { date: maxDateValue } = extractDateTimeLimit(maxDate);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const m = new Date(maxDateValue.getFullYear(), maxDateValue.getMonth(), maxDateValue.getDate());
    return d > m;
  };

  const checkDateDisabled = (date: Date): boolean => {
    if (isDateDisabled(date)) return true;
    if (isBeforeMinDate(date)) return true;
    if (isAfterMaxDate(date)) return true;
    return false;
  };

  // Calendar generation
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const calculateYearBounds = () => {
    const currentYear = today.getFullYear();
    let minYearBound = currentYear - 100;
    let maxYearBound = currentYear + 100;

    if (minDate) {
      const { date } = extractDateTimeLimit(minDate);
      minYearBound = Math.max(minYearBound, date.getFullYear());
    }
    if (maxDate) {
      const { date } = extractDateTimeLimit(maxDate);
      maxYearBound = Math.min(maxYearBound, date.getFullYear());
    }

    if (yearRange?.min !== undefined) minYearBound = yearRange.min;
    if (yearRange?.max !== undefined) maxYearBound = yearRange.max;

    return { minYearBound, maxYearBound };
  };

  const { minYearBound, maxYearBound } = calculateYearBounds();
  const yearOptions = Array.from(
    { length: Math.max(0, maxYearBound - minYearBound + 1) },
    (_, i) => minYearBound + i
  );

  const monthOptions = Array.from({ length: 12 }, (_, i) => i);

  const generateCalendarDays = (vDate: Date) => {
    const year = vDate.getFullYear();
    const month = vDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const days: Array<{ day: number; date: Date; isOther: boolean; isDisabled: boolean }> = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(year, month - 1, day);
      days.push({ day, date, isOther: true, isDisabled: checkDateDisabled(date) });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ day, date, isOther: false, isDisabled: checkDateDisabled(date) });
    }

    // Next month days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingDays = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ day, date, isOther: true, isDisabled: checkDateDisabled(date) });
    }

    // Group into weeks
    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  // Format display
  const formatPeriodText = () => {
    if (!tempValue.date) return '';

    if (format) {
      const startText = formatWithPattern(tempValue.date, tempValue.time, format);
      if (tempValue.endDate) {
        const endText = formatWithPattern(tempValue.endDate, tempValue.endTime, format);
        return `${startText} ~ ${endText}`;
      }
      return startText;
    }

    const formatKoreanDateTime = (date: Date, time?: TimeValue) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateStr = `${year}년 ${month}월 ${day}일`;
      if (type === 'datetime' && time) {
        const hours = String(time.hour).padStart(2, '0');
        const minutes = String(time.minute).padStart(2, '0');
        return `${dateStr} ${hours}:${minutes}`;
      }
      return dateStr;
    };

    const startText = formatKoreanDateTime(tempValue.date, tempValue.time);
    if (tempValue.endDate) {
      const endText = formatKoreanDateTime(tempValue.endDate, tempValue.endTime);
      return `${startText} ~ ${endText}`;
    }
    return startText;
  };

  const getDateOnlyFormat = (): string | undefined => {
    if (!format) return undefined;
    return format.replace(/\s*h[:\s]*i[분]?/g, '').replace(/\s*h시\s*i분/g, '').trim();
  };

  const formatDateDisplay = (date: Date | undefined): string => {
    if (!date) {
      const dateFormat = getDateOnlyFormat();
      return dateFormat
        ? dateFormat.replace(/y/g, 'YYYY').replace(/m/g, 'MM').replace(/d/g, 'DD')
        : 'YYYY - MM - DD';
    }

    const dateFormat = getDateOnlyFormat();
    return dateFormat
      ? formatWithPattern(date, undefined, dateFormat)
      : `${date.getFullYear()} - ${String(date.getMonth() + 1).padStart(2, '0')} - ${String(date.getDate()).padStart(2, '0')}`;
  };

  // Event handlers
  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef && !containerRef.contains(event.target as Node)) {
      selectingPart = null;
    }
  };

  const handlePartClick = (part: SelectingPart) => {
    if (disabled) return;
    selectingPart = selectingPart === part ? null : part;
  };

  const adjustTimeForDate = (date: Date, time: TimeValue | undefined): TimeValue | undefined => {
    if (!time) return time;

    const minLimit = minDate ? extractDateTimeLimit(minDate) : null;
    const maxLimit = maxDate ? extractDateTimeLimit(maxDate) : null;

    let adjustedHour = time.hour;
    let adjustedMinute = time.minute;

    if (minLimit?.time && isSameDay(date, minLimit.date)) {
      if (adjustedHour < minLimit.time.hour) {
        adjustedHour = minLimit.time.hour;
        adjustedMinute = Math.ceil(minLimit.time.minute / minuteStep) * minuteStep;
      } else if (adjustedHour === minLimit.time.hour && adjustedMinute < minLimit.time.minute) {
        adjustedMinute = Math.ceil(minLimit.time.minute / minuteStep) * minuteStep;
      }
    }

    if (maxLimit?.time && isSameDay(date, maxLimit.date)) {
      if (adjustedHour > maxLimit.time.hour) {
        adjustedHour = maxLimit.time.hour;
        adjustedMinute = Math.floor(maxLimit.time.minute / minuteStep) * minuteStep;
      } else if (adjustedHour === maxLimit.time.hour && adjustedMinute > maxLimit.time.minute) {
        adjustedMinute = Math.floor(maxLimit.time.minute / minuteStep) * minuteStep;
      }
    }

    if (adjustedHour !== time.hour || adjustedMinute !== time.minute) {
      return { hour: adjustedHour, minute: adjustedMinute };
    }
    return time;
  };

  const handleQuickSelect = (key: QuickSelectKey) => {
    const { start: originalStart, end: originalEnd } = getPresetRange(key);
    let start = originalStart;
    let end = originalEnd;
    if (minDate) {
      const min = minDate instanceof Date ? minDate : minDate.date;
      const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
      if (start < minDay) start = minDay;
    }
    if (maxDate) {
      const max = maxDate instanceof Date ? maxDate : maxDate.date;
      const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
      if (end > maxDay) end = maxDay;
    }
    const newValue: DatePickerValue = { date: start, endDate: end, time: tempValue.time, endTime: tempValue.endTime };
    tempValue = newValue;
    viewDate = new Date(start.getFullYear(), start.getMonth(), 1);
    endViewDate = new Date(end.getFullYear(), end.getMonth(), 1);
    navigationStep = getNavigationStepForPreset(key);
    navigationAnchor = originalStart;
    activePresetKeyState = key;
    navOffset = 0;

    if (!shouldShowActions) {
      value = newValue;
      onchange?.(newValue);
      selectingPart = null;
    }
  };

  const getShiftedRange = (direction: 1 | -1) => {
    const dv = displayValue;
    if (!dv?.date || !dv?.endDate || !navigationStep) return null;
    const anchorStart = navigationAnchor || dv.date;
    return shiftDateRange(anchorStart, anchorStart, navigationStep, direction);
  };

  const handleNavigate = (direction: 1 | -1) => {
    const dv = displayValue;
    if (!dv?.date || !dv?.endDate || !navigationStep) return;

    const range = getShiftedRange(direction);
    if (!range) return;
    const { start, end } = range;
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    if (minDate) {
      const min = minDate instanceof Date ? minDate : minDate.date;
      const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
      if (endDay < minDay) return;
    }
    if (maxDate) {
      const max = maxDate instanceof Date ? maxDate : maxDate.date;
      const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
      if (startDay > maxDay) return;
    }

    navOffset = navOffset + direction;

    let finalStart: Date = start;
    let finalEnd: Date = end;
    if (minDate) {
      const min = minDate instanceof Date ? minDate : minDate.date;
      const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
      if (startDay < minDay) finalStart = minDay;
    }
    if (maxDate) {
      const max = maxDate instanceof Date ? maxDate : maxDate.date;
      const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
      if (endDay > maxDay) finalEnd = maxDay;
    }

    navigationAnchor = start;

    const newValue: DatePickerValue = { date: finalStart, endDate: finalEnd, time: dv.time, endTime: dv.endTime };
    tempValue = newValue;
    viewDate = new Date(finalStart.getFullYear(), finalStart.getMonth(), 1);
    endViewDate = new Date(finalEnd.getFullYear(), finalEnd.getMonth(), 1);
    value = newValue;
    onchange?.(newValue);
  };

  const isNavDisabled = (direction: 1 | -1): boolean => {
    const range = getShiftedRange(direction);
    if (!range) return true;
    const { start, end } = range;
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    if (direction === -1 && minDate) {
      const min = minDate instanceof Date ? minDate : minDate.date;
      const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
      return endDay < minDay;
    }
    if (direction === 1 && maxDate) {
      const max = maxDate instanceof Date ? maxDate : maxDate.date;
      const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
      return startDay > maxDay;
    }
    return false;
  };

  const handleDateSelect = (date: Date) => {
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (mode === 'instant') {
      const adjustedTime = adjustTimeForDate(newDate, tempValue.time);
      const newValue = { ...tempValue, date: newDate, time: adjustedTime };
      tempValue = newValue;
      if (!shouldShowActions) {
        value = newValue;
        onchange?.(newValue);
      }
      selectingPart = null;
      return;
    }

    // Period mode
    const existingStartDate = tempValue.date;
    const existingEndDate = tempValue.endDate;

    if (!existingStartDate) {
      const adjustedTime = adjustTimeForDate(newDate, tempValue.time);
      tempValue = { ...tempValue, date: newDate, time: adjustedTime };
      return;
    }

    if (!existingEndDate) {
      const dateOnly = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      const startDateOnly = new Date(existingStartDate.getFullYear(), existingStartDate.getMonth(), existingStartDate.getDate());

      if (dateOnly < startDateOnly) {
        const adjustedStartTime = adjustTimeForDate(newDate, tempValue.time);
        const adjustedEndTime = adjustTimeForDate(existingStartDate, tempValue.time);
        tempValue = {
          date: newDate,
          time: adjustedStartTime,
          endDate: existingStartDate,
          endTime: adjustedEndTime,
        };
        navigationStep = calculateNavigationStep(newDate, existingStartDate);
        navigationAnchor = newDate;
      } else {
        const adjustedEndTime = adjustTimeForDate(newDate, tempValue.endTime);
        tempValue = { ...tempValue, endDate: newDate, endTime: adjustedEndTime };
        navigationStep = calculateNavigationStep(existingStartDate, newDate);
        navigationAnchor = existingStartDate;
      }
      activePresetKeyState = null;
      navOffset = 0;
      return;
    }

    // Reset when both are selected
    const adjustedTime = adjustTimeForDate(newDate, tempValue.time);
    tempValue = { date: newDate, time: adjustedTime, endDate: undefined, endTime: undefined };
    activePresetKeyState = null;
    navOffset = 0;
  };

  const handleReset = () => {
    tempValue = {};
    selectingPart = null;
    onreset?.();
  };

  const handleApply = () => {
    value = tempValue;
    onchange?.(tempValue);
    selectingPart = null;
  };

  const handleYearChange = (e: Event, isEnd = false) => {
    const target = e.target as HTMLSelectElement;
    const newYear = parseInt(target.value);
    if (isEnd) {
      endViewDate = new Date(newYear, endViewDate.getMonth(), 1);
    } else {
      viewDate = new Date(newYear, viewDate.getMonth(), 1);
    }
  };

  const handleMonthChange = (e: Event, isEnd = false) => {
    const target = e.target as HTMLSelectElement;
    const newMonth = parseInt(target.value);
    if (isEnd) {
      endViewDate = new Date(endViewDate.getFullYear(), newMonth, 1);
    } else {
      viewDate = new Date(viewDate.getFullYear(), newMonth, 1);
    }
  };

  const handlePrevMonth = (isEnd = false) => {
    if (isEnd) {
      endViewDate = new Date(endViewDate.getFullYear(), endViewDate.getMonth() - 1, 1);
    } else {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    }
  };

  const handleNextMonth = (isEnd = false) => {
    if (isEnd) {
      endViewDate = new Date(endViewDate.getFullYear(), endViewDate.getMonth() + 1, 1);
    } else {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    }
  };

  const handleHourChange = (e: Event, isEnd = false) => {
    const target = e.target as HTMLSelectElement;
    const hour = parseInt(target.value);
    const currentTime = isEnd ? tempValue.endTime : tempValue.time;
    const newTime: TimeValue = { hour, minute: currentTime?.minute ?? 0 };

    const newValue = isEnd
      ? { ...tempValue, endTime: newTime }
      : { ...tempValue, time: newTime };
    tempValue = newValue;
    if (!shouldShowActions) {
      value = newValue;
      onchange?.(newValue);
    }
  };

  const handleMinuteChange = (e: Event, isEnd = false) => {
    const target = e.target as HTMLSelectElement;
    const minute = parseInt(target.value);
    const currentTime = isEnd ? tempValue.endTime : tempValue.time;
    const newTime: TimeValue = { hour: currentTime?.hour ?? 0, minute };

    const newValue = isEnd
      ? { ...tempValue, endTime: newTime }
      : { ...tempValue, time: newTime };
    tempValue = newValue;
    if (!shouldShowActions) {
      value = newValue;
      onchange?.(newValue);
    }
  };

  // Time select options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

  // Calendar cell class computation
  const getCellClass = (dayInfo: { day: number; date: Date; isOther: boolean; isDisabled: boolean }) => {
    const { date, isOther, isDisabled } = dayInfo;
    const classes = [styles.calendarCell];

    if (isDisabled) classes.push(styles.disabled);
    if (isOther) classes.push(styles.other);

    const isToday = isSameDay(date, today);
    const isSelected = tempValue.date && isSameDay(date, tempValue.date);
    const isRangeStart = mode === 'period' && tempValue.date && isSameDay(date, tempValue.date);
    const isRangeEnd = mode === 'period' && tempValue.endDate && isSameDay(date, tempValue.endDate);
    const isInRangeDay = mode === 'period' && tempValue.date && tempValue.endDate &&
      isInRangeExclusive(date, tempValue.date, tempValue.endDate);

    if (isToday && !isSelected && !isRangeStart && !isRangeEnd) classes.push(styles.today);
    if (mode === 'instant' && isSelected) classes.push(styles.selected);
    if (isRangeStart) classes.push(styles.rangeStart);
    if (isRangeEnd) classes.push(styles.rangeEnd);
    if (isInRangeDay) classes.push(styles.inRange);

    return classes.join(' ');
  };

  // Initialize
  $effect(() => {
    tempValue = value || {};
  });

  // 초기 value 또는 외부에서 value 변경 시 프리셋 자동 매칭
  $effect(() => {
    if (!quickSelect || mode !== 'period') return;
    if (!value?.date || !value?.endDate) return;

    for (const preset of QUICK_SELECT_PRESETS) {
      const { start, end } = getPresetRange(preset.key);
      if (isSameDay(value.date, start) && isSameDay(value.endDate, end)) {
        activePresetKeyState = preset.key;
        navOffset = 0;
        navigationStep = getNavigationStepForPreset(preset.key);
        return;
      }
    }
  });

  $effect(() => {
    if (value?.date) {
      viewDate = value.date;
    } else if (initialCalendar?.start) {
      viewDate = resolveCalendarInitial(initialCalendar.start, new Date());
    }

    if (value?.endDate) {
      endViewDate = new Date(value.endDate.getFullYear(), value.endDate.getMonth() + 1, 1);
    } else if (initialCalendar?.end) {
      endViewDate = resolveCalendarInitial(initialCalendar.end, new Date());
    }
  });

  onMount(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  });
</script>

<div bind:this={containerRef} class="{styles.datepicker} {className}" {...rest}>
  <div class="{styles.input} {showNavigation ? styles.withNav : ''} {isOpen ? styles.active : ''} {disabled ? styles.disabled : ''}">
    {#if showNavigation}
      <button
        type="button"
        class="{styles.navArrow} {styles.navArrowLeft}"
        onclick={(e) => { e.stopPropagation(); handleNavigate(-1); }}
        disabled={disabled || isNavDisabled(-1)}
      >
        <i class="icon-expand-left"></i>
      </button>
    {/if}
    {#if showNavigation && activePresetLabel}
      <span class={styles.presetLabel}>{activePresetLabel} :</span>
    {/if}
    <div class={styles.inputContent}>
      {#if type === 'date'}
        {#if mode === 'period'}
          <button
            type="button"
            class="{styles.inputPart} {selectingPart === 'date' ? styles.active : ''} {!hasStartValue ? styles.placeholder : ''}"
            onclick={() => handlePartClick('date')}
          >
            {formatDateDisplay(displayValue?.date)}
          </button>
          <span class={styles.separator}>~</span>
          <button
            type="button"
            class="{styles.inputPart} {selectingPart === 'endDate' ? styles.active : ''} {!hasEndValue ? styles.placeholder : ''}"
            onclick={() => handlePartClick('endDate')}
          >
            {formatDateDisplay(displayValue?.endDate)}
          </button>
        {:else}
          <button
            type="button"
            class="{styles.inputPart} {selectingPart === 'date' ? styles.active : ''} {!hasStartValue ? styles.placeholder : ''}"
            onclick={() => handlePartClick('date')}
          >
            {formatDateDisplay(displayValue?.date)}
          </button>
        {/if}
      {:else if type === 'time'}
        {#if mode === 'period'}
          <div class={styles.timeSection}>
            <select
              class="{styles.timeSelect} {!displayValue?.time ? styles.placeholder : ''}"
              value={displayValue?.time?.hour ?? 0}
              onchange={(e) => handleHourChange(e, false)}
              {disabled}
            >
              {#each hours as h}
                <option value={h}>{String(h).padStart(2, '0')}</option>
              {/each}
            </select>
            <span class={styles.timeSeparator}>:</span>
            <select
              class="{styles.timeSelect} {!displayValue?.time ? styles.placeholder : ''}"
              value={displayValue?.time?.minute ?? 0}
              onchange={(e) => handleMinuteChange(e, false)}
              {disabled}
            >
              {#each minutes as m}
                <option value={m}>{String(m).padStart(2, '0')}</option>
              {/each}
            </select>
          </div>
          <span class={styles.separator}>~</span>
          <div class={styles.timeSection}>
            <select
              class="{styles.timeSelect} {!displayValue?.endTime ? styles.placeholder : ''}"
              value={displayValue?.endTime?.hour ?? 0}
              onchange={(e) => handleHourChange(e, true)}
              {disabled}
            >
              {#each hours as h}
                <option value={h}>{String(h).padStart(2, '0')}</option>
              {/each}
            </select>
            <span class={styles.timeSeparator}>:</span>
            <select
              class="{styles.timeSelect} {!displayValue?.endTime ? styles.placeholder : ''}"
              value={displayValue?.endTime?.minute ?? 0}
              onchange={(e) => handleMinuteChange(e, true)}
              {disabled}
            >
              {#each minutes as m}
                <option value={m}>{String(m).padStart(2, '0')}</option>
              {/each}
            </select>
          </div>
        {:else}
          <div class={styles.timeSection}>
            <select
              class="{styles.timeSelect} {!displayValue?.time ? styles.placeholder : ''}"
              value={displayValue?.time?.hour ?? 0}
              onchange={(e) => handleHourChange(e, false)}
              {disabled}
            >
              {#each hours as h}
                <option value={h}>{String(h).padStart(2, '0')}</option>
              {/each}
            </select>
            <span class={styles.timeSeparator}>:</span>
            <select
              class="{styles.timeSelect} {!displayValue?.time ? styles.placeholder : ''}"
              value={displayValue?.time?.minute ?? 0}
              onchange={(e) => handleMinuteChange(e, false)}
              {disabled}
            >
              {#each minutes as m}
                <option value={m}>{String(m).padStart(2, '0')}</option>
              {/each}
            </select>
          </div>
        {/if}
      {:else}
        <!-- datetime -->
        {#if mode === 'period'}
          <button
            type="button"
            class="{styles.inputPart} {selectingPart === 'date' ? styles.active : ''} {!hasStartValue ? styles.placeholder : ''}"
            onclick={() => handlePartClick('date')}
          >
            {formatDateDisplay(displayValue?.date)}
          </button>
          <div class={styles.timeSection}>
            <select
              class="{styles.timeSelect} {!displayValue?.time ? styles.placeholder : ''}"
              value={displayValue?.time?.hour ?? 0}
              onchange={(e) => handleHourChange(e, false)}
              {disabled}
            >
              {#each hours as h}
                <option value={h}>{String(h).padStart(2, '0')}</option>
              {/each}
            </select>
            <span class={styles.timeSeparator}>:</span>
            <select
              class="{styles.timeSelect} {!displayValue?.time ? styles.placeholder : ''}"
              value={displayValue?.time?.minute ?? 0}
              onchange={(e) => handleMinuteChange(e, false)}
              {disabled}
            >
              {#each minutes as m}
                <option value={m}>{String(m).padStart(2, '0')}</option>
              {/each}
            </select>
          </div>
          <span class={styles.separator}>~</span>
          <button
            type="button"
            class="{styles.inputPart} {selectingPart === 'endDate' ? styles.active : ''} {!hasEndValue ? styles.placeholder : ''}"
            onclick={() => handlePartClick('endDate')}
          >
            {formatDateDisplay(displayValue?.endDate)}
          </button>
          <div class={styles.timeSection}>
            <select
              class="{styles.timeSelect} {!displayValue?.endTime ? styles.placeholder : ''}"
              value={displayValue?.endTime?.hour ?? 0}
              onchange={(e) => handleHourChange(e, true)}
              {disabled}
            >
              {#each hours as h}
                <option value={h}>{String(h).padStart(2, '0')}</option>
              {/each}
            </select>
            <span class={styles.timeSeparator}>:</span>
            <select
              class="{styles.timeSelect} {!displayValue?.endTime ? styles.placeholder : ''}"
              value={displayValue?.endTime?.minute ?? 0}
              onchange={(e) => handleMinuteChange(e, true)}
              {disabled}
            >
              {#each minutes as m}
                <option value={m}>{String(m).padStart(2, '0')}</option>
              {/each}
            </select>
          </div>
        {:else}
          <button
            type="button"
            class="{styles.inputPart} {selectingPart === 'date' ? styles.active : ''} {!hasStartValue ? styles.placeholder : ''}"
            onclick={() => handlePartClick('date')}
          >
            {formatDateDisplay(displayValue?.date)}
          </button>
          <div class={styles.timeSection}>
            <select
              class="{styles.timeSelect} {!displayValue?.time ? styles.placeholder : ''}"
              value={displayValue?.time?.hour ?? 0}
              onchange={(e) => handleHourChange(e, false)}
              {disabled}
            >
              {#each hours as h}
                <option value={h}>{String(h).padStart(2, '0')}</option>
              {/each}
            </select>
            <span class={styles.timeSeparator}>:</span>
            <select
              class="{styles.timeSelect} {!displayValue?.time ? styles.placeholder : ''}"
              value={displayValue?.time?.minute ?? 0}
              onchange={(e) => handleMinuteChange(e, false)}
              {disabled}
            >
              {#each minutes as m}
                <option value={m}>{String(m).padStart(2, '0')}</option>
              {/each}
            </select>
          </div>
        {/if}
      {/if}
    </div>
    {#if !showNavigation}
      <i class="{styles.inputIcon} {inputIcon}"></i>
    {/if}
    {#if showNavigation}
      <button
        type="button"
        class="{styles.navArrow} {styles.navArrowRight}"
        onclick={(e) => { e.stopPropagation(); handleNavigate(1); }}
        disabled={disabled || isNavDisabled(1)}
      >
        <i class="icon-expand-right"></i>
      </button>
    {/if}
  </div>

  {#if isOpen}
    <div class="{styles.dropdown} {align === 'right' ? styles.right : ''} {resolvedDirection === 'up' ? styles.dropdownUp : ''}">
      {#snippet periodCalendars()}
        <!-- Period mode: two calendars -->
        <div class={styles.periodCalendars}>
          <div class={styles.periodCalendarLeft}>
            <div class={styles.calendar}>
              <div class={styles.calendarNav}>
                <button type="button" class={styles.navButton} onclick={() => handlePrevMonth(false)}>
                  <i class="icon-expand-left"></i>
                </button>
                <div class={styles.navTitle}>
                  <div class={styles.navSelectWrapper}>
                    <select class={styles.navSelect} value={viewDate.getFullYear()} onchange={(e) => handleYearChange(e, false)}>
                      {#each yearOptions as y}
                        <option value={y}>{y}년</option>
                      {/each}
                    </select>
                  </div>
                  <div class={styles.navSelectWrapper}>
                    <select class={styles.navSelect} value={viewDate.getMonth()} onchange={(e) => handleMonthChange(e, false)}>
                      {#each monthOptions as m}
                        <option value={m}>{m + 1}월</option>
                      {/each}
                    </select>
                  </div>
                </div>
                <button type="button" class={styles.navButton} onclick={() => handleNextMonth(false)}>
                  <i class="icon-expand-right"></i>
                </button>
              </div>
              <div class={styles.calendarGrid}>
                <div class={styles.calendarRow}>
                  {#each weekDays as day}
                    <div class="{styles.calendarCell} {styles.header}">{day}</div>
                  {/each}
                </div>
                {#each generateCalendarDays(viewDate) as week}
                  <div class={styles.calendarRow}>
                    {#each week as dayInfo}
                      <button
                        type="button"
                        class={getCellClass(dayInfo)}
                        onclick={() => !dayInfo.isDisabled && handleDateSelect(dayInfo.date)}
                        disabled={dayInfo.isDisabled}
                      >
                        {dayInfo.day}
                      </button>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
          </div>
          <div class={styles.periodCalendarRight}>
            <div class={styles.calendar}>
              <div class={styles.calendarNav}>
                <button type="button" class={styles.navButton} onclick={() => handlePrevMonth(true)}>
                  <i class="icon-expand-left"></i>
                </button>
                <div class={styles.navTitle}>
                  <div class={styles.navSelectWrapper}>
                    <select class={styles.navSelect} value={endViewDate.getFullYear()} onchange={(e) => handleYearChange(e, true)}>
                      {#each yearOptions as y}
                        <option value={y}>{y}년</option>
                      {/each}
                    </select>
                  </div>
                  <div class={styles.navSelectWrapper}>
                    <select class={styles.navSelect} value={endViewDate.getMonth()} onchange={(e) => handleMonthChange(e, true)}>
                      {#each monthOptions as m}
                        <option value={m}>{m + 1}월</option>
                      {/each}
                    </select>
                  </div>
                </div>
                <button type="button" class={styles.navButton} onclick={() => handleNextMonth(true)}>
                  <i class="icon-expand-right"></i>
                </button>
              </div>
              <div class={styles.calendarGrid}>
                <div class={styles.calendarRow}>
                  {#each weekDays as day}
                    <div class="{styles.calendarCell} {styles.header}">{day}</div>
                  {/each}
                </div>
                {#each generateCalendarDays(endViewDate) as week}
                  <div class={styles.calendarRow}>
                    {#each week as dayInfo}
                      <button
                        type="button"
                        class={getCellClass(dayInfo)}
                        onclick={() => !dayInfo.isDisabled && handleDateSelect(dayInfo.date)}
                        disabled={dayInfo.isDisabled}
                      >
                        {dayInfo.day}
                      </button>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/snippet}

      {#if mode === 'period'}
        {#if quickSelect}
          <div class={styles.dropdownBody}>
            <div class={styles.quickSelectPanel}>
              {#each QUICK_SELECT_PRESETS as preset}
                {@const presetDisabled = checkPresetDisabled(preset.key, minDate, maxDate)}
                {@const active = isPresetActiveCheck(preset.key)}
                <button
                  type="button"
                  class="{styles.quickSelectItem}{active ? ` ${styles.active}` : ''}{presetDisabled ? ` ${styles.disabled}` : ''}"
                  onclick={() => !presetDisabled && handleQuickSelect(preset.key)}
                  disabled={presetDisabled}
                >
                  {preset.label}
                </button>
              {/each}
            </div>
            {@render periodCalendars()}
          </div>
        {:else}
          {@render periodCalendars()}
        {/if}
      {:else}
        <!-- Instant mode: single calendar -->
        <div class={styles.calendar}>
          <div class={styles.calendarNav}>
            <button type="button" class={styles.navButton} onclick={() => handlePrevMonth(false)}>
              <i class="icon-expand-left"></i>
            </button>
            <div class={styles.navTitle}>
              <div class={styles.navSelectWrapper}>
                <select class={styles.navSelect} value={viewDate.getFullYear()} onchange={(e) => handleYearChange(e, false)}>
                  {#each yearOptions as y}
                    <option value={y}>{y}년</option>
                  {/each}
                </select>
              </div>
              <div class={styles.navSelectWrapper}>
                <select class={styles.navSelect} value={viewDate.getMonth()} onchange={(e) => handleMonthChange(e, false)}>
                  {#each monthOptions as m}
                    <option value={m}>{m + 1}월</option>
                  {/each}
                </select>
              </div>
            </div>
            <button type="button" class={styles.navButton} onclick={() => handleNextMonth(false)}>
              <i class="icon-expand-right"></i>
            </button>
          </div>
          <div class={styles.calendarGrid}>
            <div class={styles.calendarRow}>
              {#each weekDays as day}
                <div class="{styles.calendarCell} {styles.header}">{day}</div>
              {/each}
            </div>
            {#each generateCalendarDays(viewDate) as week}
              <div class={styles.calendarRow}>
                {#each week as dayInfo}
                  <button
                    type="button"
                    class={getCellClass(dayInfo)}
                    onclick={() => !dayInfo.isDisabled && handleDateSelect(dayInfo.date)}
                    disabled={dayInfo.isDisabled}
                  >
                    {dayInfo.day}
                  </button>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if shouldShowActions}
        <div class={styles.bottomActions}>
          <span class={styles.periodText}>
            {mode === 'period' && tempValue.date ? formatPeriodText() : ''}
          </span>
          <div class={styles.actionButtons}>
            <button type="button" class="{styles.actionButton} {styles.reset}" onclick={handleReset}>
              <i class="icon-refresh"></i>
              초기화
            </button>
            <button type="button" class="{styles.actionButton} {styles.apply}" onclick={handleApply}>
              적용
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
