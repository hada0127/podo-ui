'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './datepicker.module.scss';

// Types
export type DatePickerMode = 'instant' | 'period';
export type DatePickerType = 'date' | 'time' | 'datetime';

/** 시간 값 (시, 분) */
export interface TimeValue {
  hour: number;
  minute: number;
}

export interface DatePickerValue {
  /** 시작 날짜 (년, 월, 일) */
  date?: Date;
  /** 시작 시간 (시, 분) */
  time?: TimeValue;
  /** 종료 날짜 (년, 월, 일) - period 모드에서 사용 */
  endDate?: Date;
  /** 종료 시간 (시, 분) - period 모드에서 사용 */
  endTime?: TimeValue;
}

/** 날짜 범위 정의 */
export interface DateRange {
  from: Date;
  to: Date;
}

/** 날짜 비활성화/활성화 조건 타입 */
export type DateCondition = Date | DateRange | ((date: Date) => boolean);

/** 날짜+시간 제한 값 (날짜만 또는 날짜+시간) */
export interface DateTimeLimit {
  date: Date;
  time?: TimeValue;
}

/** 분 단위 선택 옵션 */
export type MinuteStep = 1 | 5 | 10 | 15 | 20 | 30;

/** 년도 선택 범위 */
export interface YearRange {
  /** 최소 년도 */
  min?: number;
  /** 최대 년도 */
  max?: number;
}

/** 초기 달력 표시 월 설정 */
export type CalendarInitial = 'now' | 'prevMonth' | 'nextMonth' | Date;

export interface InitialCalendar {
  /** 시작 달력 초기 월 (period 모드의 왼쪽 달력) */
  start?: CalendarInitial;
  /** 종료 달력 초기 월 (period 모드의 오른쪽 달력) */
  end?: CalendarInitial;
}

export interface DatePickerProps {
  /** 선택 모드: instant(단일) | period(기간) */
  mode?: DatePickerMode;
  /** 값 타입: date | time | datetime */
  type?: DatePickerType;
  /** 선택된 값 */
  value?: DatePickerValue;
  /** 값 변경 콜백 */
  onChange?: (value: DatePickerValue) => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 비활성화 */
  disabled?: boolean;
  /** 하단 버튼 표시 (mode가 period일 때 기본 true) */
  showActions?: boolean;
  /** 드롭다운 정렬 */
  align?: 'left' | 'right';
  /** 클래스명 */
  className?: string;
  /** 선택 불가능한 날짜 조건 (특정 날짜, 범위, 함수) */
  disable?: DateCondition[];
  /** 선택 가능한 날짜 조건 (지정된 날짜만 활성화) */
  enable?: DateCondition[];
  /** 선택 가능한 최소 날짜 (Date 또는 { date, time }) */
  minDate?: Date | DateTimeLimit;
  /** 선택 가능한 최대 날짜 (Date 또는 { date, time }) */
  maxDate?: Date | DateTimeLimit;
  /** 분 단위 선택 간격 (1, 5, 10, 15, 30) 기본값: 1 */
  minuteStep?: MinuteStep;
  /**
   * 날짜/시간 표시 포맷
   * y: 년, m: 월, d: 일, h: 시, i: 분
   * 예시: "y-m-d", "y.m.d h:i", "y년 m월 d일 h시 i분"
   */
  format?: string;
  /**
   * 기간 선택 모드에서 초기 달력 표시 월 설정
   * start: 왼쪽 달력, end: 오른쪽 달력
   * 값: 'now' | 'prevMonth' | 'nextMonth' | Date
   */
  initialCalendar?: InitialCalendar;
  /**
   * 년도 선택 범위 설정
   * minDate/maxDate보다 우선 적용됨
   * 예시: { min: 2020, max: 2030 }
   */
  yearRange?: YearRange;
}

// Helper functions

/** CalendarInitial 값을 Date로 변환 */
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

/**
 * 커스텀 포맷으로 날짜/시간 포맷팅
 * y: 년(4자리), m: 월(2자리), d: 일(2자리), h: 시(2자리), i: 분(2자리)
 */
const formatWithPattern = (
  date: Date | undefined,
  time: TimeValue | undefined,
  pattern: string
): string => {
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

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year} - ${month} - ${day}`;
};

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours} : ${minutes}`;
};

const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
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

/** DateRange 타입 가드 */
const isDateRange = (condition: DateCondition): condition is DateRange => {
  return typeof condition === 'object' && 'from' in condition && 'to' in condition;
};

/** 날짜가 조건에 해당하는지 확인 */
const matchesCondition = (date: Date, condition: DateCondition): boolean => {
  if (typeof condition === 'function') {
    return condition(date);
  }
  if (isDateRange(condition)) {
    return isInRange(date, condition.from, condition.to);
  }
  // Date 타입
  return isSameDay(date, condition);
};

/** 날짜가 비활성화되어야 하는지 확인 */
const isDateDisabled = (
  date: Date,
  disable?: DateCondition[],
  enable?: DateCondition[]
): boolean => {
  // enable이 지정된 경우: 지정된 조건에 맞지 않으면 비활성화
  if (enable && enable.length > 0) {
    const isEnabled = enable.some((condition) => matchesCondition(date, condition));
    return !isEnabled;
  }

  // disable이 지정된 경우: 지정된 조건에 맞으면 비활성화
  if (disable && disable.length > 0) {
    return disable.some((condition) => matchesCondition(date, condition));
  }

  return false;
};

/** DateTimeLimit 타입 가드 */
const isDateTimeLimit = (value: Date | DateTimeLimit): value is DateTimeLimit => {
  return typeof value === 'object' && 'date' in value && !(value instanceof Date);
};

/** DateTimeLimit에서 Date와 TimeValue 추출 */
const extractDateTimeLimit = (limit: Date | DateTimeLimit): { date: Date; time?: TimeValue } => {
  if (isDateTimeLimit(limit)) {
    return { date: limit.date, time: limit.time };
  }
  return { date: limit };
};

/** 날짜가 minDate보다 이전인지 확인 (날짜만 비교) */
const isBeforeMinDate = (date: Date, minDate?: Date | DateTimeLimit): boolean => {
  if (!minDate) return false;
  const { date: minDateValue } = extractDateTimeLimit(minDate);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const m = new Date(minDateValue.getFullYear(), minDateValue.getMonth(), minDateValue.getDate());
  return d < m;
};

/** 날짜가 maxDate보다 이후인지 확인 (날짜만 비교) */
const isAfterMaxDate = (date: Date, maxDate?: Date | DateTimeLimit): boolean => {
  if (!maxDate) return false;
  const { date: maxDateValue } = extractDateTimeLimit(maxDate);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const m = new Date(maxDateValue.getFullYear(), maxDateValue.getMonth(), maxDateValue.getDate());
  return d > m;
};

/** 날짜+시간이 minDate보다 이전인지 확인 */
const isBeforeMinDateTime = (
  date: Date,
  time: TimeValue | undefined,
  minDate?: Date | DateTimeLimit
): boolean => {
  if (!minDate) return false;
  const { date: minDateValue, time: minTime } = extractDateTimeLimit(minDate);

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const m = new Date(minDateValue.getFullYear(), minDateValue.getMonth(), minDateValue.getDate());

  if (d < m) return true;
  if (d > m) return false;

  // 같은 날짜: 시간 비교
  if (minTime && time) {
    if (time.hour < minTime.hour) return true;
    if (time.hour === minTime.hour && time.minute < minTime.minute) return true;
  }
  return false;
};

/** 날짜+시간이 maxDate보다 이후인지 확인 */
const isAfterMaxDateTime = (
  date: Date,
  time: TimeValue | undefined,
  maxDate?: Date | DateTimeLimit
): boolean => {
  if (!maxDate) return false;
  const { date: maxDateValue, time: maxTime } = extractDateTimeLimit(maxDate);

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const m = new Date(maxDateValue.getFullYear(), maxDateValue.getMonth(), maxDateValue.getDate());

  if (d > m) return true;
  if (d < m) return false;

  // 같은 날짜: 시간 비교
  if (maxTime && time) {
    if (time.hour > maxTime.hour) return true;
    if (time.hour === maxTime.hour && time.minute > maxTime.minute) return true;
  }
  return false;
};

// Calendar Component
interface CalendarProps {
  value?: Date;
  endValue?: Date;
  mode: DatePickerMode;
  onSelect: (date: Date) => void;
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
  /** 네비게이션 버튼 표시 여부 (기본: true) */
  showPrevNav?: boolean;
  showNextNav?: boolean;
  /** 이동 가능한 최소 년/월 (이 값보다 이전으로 이동 불가) */
  minViewDate?: Date;
  /** 이동 가능한 최대 년/월 (이 값보다 이후로 이동 불가) */
  maxViewDate?: Date;
  /** 선택 불가능한 날짜 조건 */
  disable?: DateCondition[];
  /** 선택 가능한 날짜 조건 */
  enable?: DateCondition[];
  /** 선택 가능한 최소 날짜 */
  minDate?: Date | DateTimeLimit;
  /** 선택 가능한 최대 날짜 */
  maxDate?: Date | DateTimeLimit;
  /** 년도 선택 범위 */
  yearRange?: YearRange;
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  endValue,
  mode,
  onSelect,
  viewDate,
  onViewDateChange,
  showPrevNav = true,
  showNextNav = true,
  minViewDate,
  maxViewDate,
  disable,
  enable,
  minDate,
  maxDate,
  yearRange,
}) => {
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 년도 범위 계산 (우선순위: yearRange > minDate/maxDate > 기본값 ±10년)
  const currentYear = today.getFullYear();
  const calculateYearBounds = () => {
    let minYearBound = currentYear - 10;
    let maxYearBound = currentYear + 10;

    // minDate/maxDate에서 년도 추출
    if (minDate) {
      const { date } = extractDateTimeLimit(minDate);
      minYearBound = Math.max(minYearBound, date.getFullYear());
    }
    if (maxDate) {
      const { date } = extractDateTimeLimit(maxDate);
      maxYearBound = Math.min(maxYearBound, date.getFullYear());
    }

    // yearRange가 있으면 우선 적용
    if (yearRange?.min !== undefined) minYearBound = yearRange.min;
    if (yearRange?.max !== undefined) maxYearBound = yearRange.max;

    return { minYearBound, maxYearBound };
  };

  const { minYearBound, maxYearBound } = calculateYearBounds();
  const yearOptions = Array.from(
    { length: Math.max(0, maxYearBound - minYearBound + 1) },
    (_, i) => minYearBound + i
  );

  // 월 옵션: 1~12월
  const monthOptions = Array.from({ length: 12 }, (_, i) => i);

  // minViewDate/maxViewDate 기반 제한 계산
  const minYear = minViewDate?.getFullYear();
  const minMonth = minViewDate?.getMonth();
  const maxYear = maxViewDate?.getFullYear();
  const maxMonth = maxViewDate?.getMonth();

  // 이전 월 버튼 비활성화 여부
  const isPrevDisabled = minViewDate
    ? year < minYear! || (year === minYear && month <= minMonth!)
    : false;

  // 다음 월 버튼 비활성화 여부
  const isNextDisabled = maxViewDate
    ? year > maxYear! || (year === maxYear && month >= maxMonth!)
    : false;

  // 년도 옵션 필터링 (선택 가능한 년도만)
  const filteredYearOptions = yearOptions.filter((y) => {
    if (minYear !== undefined && y < minYear) return false;
    if (maxYear !== undefined && y > maxYear) return false;
    return true;
  });

  // 월 옵션 필터링 (현재 선택된 년도에서 선택 가능한 월만)
  const filteredMonthOptions = monthOptions.filter((m) => {
    if (minYear !== undefined && minMonth !== undefined) {
      if (year === minYear && m < minMonth) return false;
    }
    if (maxYear !== undefined && maxMonth !== undefined) {
      if (year === maxYear && m > maxMonth) return false;
    }
    return true;
  });

  const handlePrevMonth = () => {
    if (isPrevDisabled) return;
    onViewDateChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    if (isNextDisabled) return;
    onViewDateChange(new Date(year, month + 1, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onViewDateChange(new Date(parseInt(e.target.value), month, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onViewDateChange(new Date(year, parseInt(e.target.value), 1));
  };

  const renderDaysView = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const days: React.ReactNode[] = [];

    // 날짜 비활성화 확인 (disable/enable + minDate/maxDate)
    const checkDateDisabled = (date: Date): boolean => {
      if (isDateDisabled(date, disable, enable)) return true;
      if (isBeforeMinDate(date, minDate)) return true;
      if (isAfterMaxDate(date, maxDate)) return true;
      return false;
    };

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, day);
      const isDisabled = checkDateDisabled(prevDate);
      days.push(
        <button
          key={`prev-${day}`}
          type="button"
          className={`${styles.calendarCell} ${styles.other} ${isDisabled ? styles.disabled : ''}`}
          onClick={() => !isDisabled && onSelect(prevDate)}
          disabled={isDisabled}
        >
          {day}
        </button>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isSameDay(date, today);
      const isSelected = value && isSameDay(date, value);
      const isRangeStart = mode === 'period' && value && isSameDay(date, value);
      const isRangeEnd = mode === 'period' && endValue && isSameDay(date, endValue);
      const isInRangeDay =
        mode === 'period' && value && endValue && isInRangeExclusive(date, value, endValue);
      const isDisabled = checkDateDisabled(date);

      let cellClass = styles.calendarCell;
      if (isDisabled) cellClass += ` ${styles.disabled}`;
      if (isToday && !isSelected && !isRangeStart && !isRangeEnd) cellClass += ` ${styles.today}`;
      if (mode === 'instant' && isSelected) cellClass += ` ${styles.selected}`;
      if (isRangeStart) cellClass += ` ${styles.rangeStart}`;
      if (isRangeEnd) cellClass += ` ${styles.rangeEnd}`;
      if (isInRangeDay) cellClass += ` ${styles.inRange}`;

      days.push(
        <button
          key={day}
          type="button"
          className={cellClass}
          onClick={() => !isDisabled && onSelect(date)}
          disabled={isDisabled}
        >
          {day}
        </button>
      );
    }

    // Next month days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingDays = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      const isDisabled = checkDateDisabled(nextDate);
      days.push(
        <button
          key={`next-${day}`}
          type="button"
          className={`${styles.calendarCell} ${styles.other} ${isDisabled ? styles.disabled : ''}`}
          onClick={() => !isDisabled && onSelect(nextDate)}
          disabled={isDisabled}
        >
          {day}
        </button>
      );
    }

    // Group into rows
    const rows: React.ReactNode[] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(
        <div key={i} className={styles.calendarRow}>
          {days.slice(i, i + 7)}
        </div>
      );
    }

    return (
      <>
        <div className={styles.calendarRow}>
          {weekDays.map((day) => (
            <div key={day} className={`${styles.calendarCell} ${styles.header}`}>
              {day}
            </div>
          ))}
        </div>
        {rows}
      </>
    );
  };


  return (
    <div className={styles.calendar}>
      <div className={styles.calendarNav}>
        {showPrevNav ? (
          <button
            type="button"
            className={styles.navButton}
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
          >
            <i className="icon-expand-left" />
          </button>
        ) : (
          <div className={styles.navButtonPlaceholder} />
        )}
        <div className={styles.navTitle}>
          <div className={styles.navSelectWrapper}>
            <select
              className={styles.navSelect}
              value={year}
              onChange={handleYearChange}
            >
              {filteredYearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
          </div>
          <div className={styles.navSelectWrapper}>
            <select
              className={styles.navSelect}
              value={month}
              onChange={handleMonthChange}
            >
              {filteredMonthOptions.map((m) => (
                <option key={m} value={m}>
                  {m + 1}월
                </option>
              ))}
            </select>
          </div>
        </div>
        {showNextNav ? (
          <button
            type="button"
            className={styles.navButton}
            onClick={handleNextMonth}
            disabled={isNextDisabled}
          >
            <i className="icon-expand-right" />
          </button>
        ) : (
          <div className={styles.navButtonPlaceholder} />
        )}
      </div>
      <div className={styles.calendarGrid}>
        {renderDaysView()}
      </div>
    </div>
  );
};

// Period Calendar Component (두 개의 달력을 나란히 표시)
interface PeriodCalendarProps {
  value?: Date;
  endValue?: Date;
  onSelect: (date: Date) => void;
  viewDate: Date;
  endViewDate: Date;
  onViewDateChange: (date: Date) => void;
  onEndViewDateChange: (date: Date) => void;
  /** 선택 불가능한 날짜 조건 */
  disable?: DateCondition[];
  /** 선택 가능한 날짜 조건 */
  enable?: DateCondition[];
  /** 선택 가능한 최소 날짜 */
  minDate?: Date | DateTimeLimit;
  /** 선택 가능한 최대 날짜 */
  maxDate?: Date | DateTimeLimit;
  /** 년도 선택 범위 */
  yearRange?: YearRange;
}

const PeriodCalendar: React.FC<PeriodCalendarProps> = ({
  value,
  endValue,
  onSelect,
  viewDate,
  endViewDate,
  onViewDateChange,
  onEndViewDateChange,
  disable,
  enable,
  minDate,
  maxDate,
  yearRange,
}) => {
  // 왼쪽 달력: 오른쪽 달력(endViewDate)보다 이후로 이동 불가
  // 오른쪽 달력: 왼쪽 달력(viewDate)보다 이전으로 이동 불가
  return (
    <div className={styles.periodCalendars}>
      <div className={styles.periodCalendarLeft}>
        <Calendar
          value={value}
          endValue={endValue}
          mode="period"
          onSelect={onSelect}
          viewDate={viewDate}
          onViewDateChange={onViewDateChange}
          showPrevNav={true}
          showNextNav={true}
          maxViewDate={endViewDate}
          disable={disable}
          enable={enable}
          minDate={minDate}
          maxDate={maxDate}
          yearRange={yearRange}
        />
      </div>
      <div className={styles.periodCalendarRight}>
        <Calendar
          value={value}
          endValue={endValue}
          mode="period"
          onSelect={onSelect}
          viewDate={endViewDate}
          onViewDateChange={onEndViewDateChange}
          showPrevNav={true}
          showNextNav={true}
          minViewDate={viewDate}
          disable={disable}
          enable={enable}
          minDate={minDate}
          maxDate={maxDate}
          yearRange={yearRange}
        />
      </div>
    </div>
  );
};

// Selecting part types
type SelectingPart = 'date' | 'hour' | 'minute' | 'endDate' | 'endHour' | 'endMinute' | null;

// Main DatePicker Component
const DatePicker: React.FC<DatePickerProps> = ({
  mode = 'instant',
  type = 'date',
  value,
  onChange,
  placeholder,
  disabled = false,
  showActions,
  align = 'left',
  className,
  disable,
  enable,
  minDate,
  maxDate,
  minuteStep = 1,
  format,
  initialCalendar,
  yearRange,
}) => {
  const [selectingPart, setSelectingPart] = useState<SelectingPart>(null);
  const [tempValue, setTempValue] = useState<DatePickerValue>(value || {});

  // 초기 달력 표시 월 계산
  const [viewDate, setViewDate] = useState(() => {
    if (value?.date) return value.date;
    if (initialCalendar?.start) {
      return resolveCalendarInitial(initialCalendar.start, new Date());
    }
    return new Date();
  });

  const [endViewDate, setEndViewDate] = useState(() => {
    if (value?.endDate) {
      return new Date(value.endDate.getFullYear(), value.endDate.getMonth() + 1, 1);
    }
    if (initialCalendar?.end) {
      return resolveCalendarInitial(initialCalendar.end, new Date());
    }
    // 기본값: 현재 달의 다음 달
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1);
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const shouldShowActions = showActions ?? mode === 'period';
  // 날짜 선택 시에만 드롭다운 표시 (시/분은 native select 사용)
  const isOpen = selectingPart === 'date' || selectingPart === 'endDate';

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectingPart(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync temp value with prop value
  useEffect(() => {
    setTempValue(value || {});
  }, [value]);


  const formatPeriodText = () => {
    if (!tempValue.date) return '';

    // format prop이 있으면 사용
    if (format) {
      const startText = formatWithPattern(tempValue.date, tempValue.time, format);
      if (tempValue.endDate) {
        const endText = formatWithPattern(tempValue.endDate, tempValue.endTime, format);
        return `${startText} ~ ${endText}`;
      }
      return startText;
    }

    // 기본 포맷 (한국어)
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

  // 날짜 선택 시 시간을 minDate/maxDate 범위 내로 자동 보정
  const adjustTimeForDate = (date: Date, time: TimeValue | undefined): TimeValue | undefined => {
    if (!time) return time;

    const minLimit = minDate ? extractDateTimeLimit(minDate) : null;
    const maxLimit = maxDate ? extractDateTimeLimit(maxDate) : null;

    let adjustedHour = time.hour;
    let adjustedMinute = time.minute;

    // minDate와 같은 날짜인 경우
    if (minLimit?.time && isSameDay(date, minLimit.date)) {
      if (adjustedHour < minLimit.time.hour) {
        adjustedHour = minLimit.time.hour;
        // minuteStep에 맞춰 올림
        adjustedMinute = Math.ceil(minLimit.time.minute / minuteStep) * minuteStep;
      } else if (adjustedHour === minLimit.time.hour && adjustedMinute < minLimit.time.minute) {
        // minuteStep에 맞춰 올림
        adjustedMinute = Math.ceil(minLimit.time.minute / minuteStep) * minuteStep;
      }
    }

    // maxDate와 같은 날짜인 경우
    if (maxLimit?.time && isSameDay(date, maxLimit.date)) {
      if (adjustedHour > maxLimit.time.hour) {
        adjustedHour = maxLimit.time.hour;
        // minuteStep에 맞춰 내림
        adjustedMinute = Math.floor(maxLimit.time.minute / minuteStep) * minuteStep;
      } else if (adjustedHour === maxLimit.time.hour && adjustedMinute > maxLimit.time.minute) {
        // minuteStep에 맞춰 내림
        adjustedMinute = Math.floor(maxLimit.time.minute / minuteStep) * minuteStep;
      }
    }

    if (adjustedHour !== time.hour || adjustedMinute !== time.minute) {
      return { hour: adjustedHour, minute: adjustedMinute };
    }
    return time;
  };

  const handleDateSelect = (date: Date) => {
    // 날짜만 저장 (시간은 별도 time/endTime으로 관리)
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // instant 모드: 단일 날짜 선택 후 닫기
    if (mode === 'instant') {
      const adjustedTime = adjustTimeForDate(newDate, tempValue.time);
      const newValue = { ...tempValue, date: newDate, time: adjustedTime };
      setTempValue(newValue);
      if (!shouldShowActions) {
        onChange?.(newValue);
      }
      setSelectingPart(null);
      return;
    }

    // period 모드: 기간 선택 로직
    // 시작일/종료일이 같을 수 있음
    // 시작일이 종료일보다 이후일 수 없음 (자동 정렬)
    // 종료일이 시작일보다 이전일 수 없음 (자동 정렬)
    // 하나만 선택해도 드롭다운 유지 (적용 버튼으로 닫음)

    const existingStartDate = tempValue.date;
    const existingEndDate = tempValue.endDate;

    if (!existingStartDate) {
      // 첫 번째 날짜 선택: 시작일 설정
      const adjustedTime = adjustTimeForDate(newDate, tempValue.time);
      setTempValue({ ...tempValue, date: newDate, time: adjustedTime });
      // 드롭다운 유지 - 종료일 선택 대기
      return;
    }

    if (!existingEndDate) {
      // 두 번째 날짜 선택: 시작일/종료일 자동 정렬
      const dateOnly = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      const startDateOnly = new Date(existingStartDate.getFullYear(), existingStartDate.getMonth(), existingStartDate.getDate());

      if (dateOnly < startDateOnly) {
        // 선택한 날짜가 시작일보다 이전 → 스왑 (선택한 날짜가 시작일, 기존 시작일이 종료일)
        // 시간도 함께 스왑하고 범위 보정
        const adjustedStartTime = adjustTimeForDate(newDate, tempValue.time);
        const adjustedEndTime = adjustTimeForDate(existingStartDate, tempValue.time);
        setTempValue({
          date: newDate,
          time: adjustedStartTime,
          endDate: existingStartDate,
          endTime: adjustedEndTime,
        });
      } else {
        // 선택한 날짜가 시작일 이후/같음 → 종료일로 설정
        const adjustedEndTime = adjustTimeForDate(newDate, tempValue.endTime);
        setTempValue({ ...tempValue, endDate: newDate, endTime: adjustedEndTime });
      }
      // 드롭다운 유지 - 적용 버튼으로 닫음
      return;
    }

    // 이미 둘 다 선택된 경우 → 새로운 시작일로 리셋
    const adjustedTime = adjustTimeForDate(newDate, tempValue.time);
    setTempValue({ date: newDate, time: adjustedTime, endDate: undefined, endTime: undefined });
  };

  const handleReset = () => {
    setTempValue({});
    setSelectingPart(null);
  };

  const handleApply = () => {
    onChange?.(tempValue);
    setSelectingPart(null);
  };

  const handlePartClick = (part: SelectingPart) => {
    if (disabled) return;
    setSelectingPart(selectingPart === part ? null : part);
  };

  const displayValue = shouldShowActions ? tempValue : value;
  const hasStartValue = !!displayValue?.date;
  const hasEndValue = !!displayValue?.endDate;

  // 날짜만 표시하는 포맷 (시간 제외)
  const getDateOnlyFormat = (): string | undefined => {
    if (!format) return undefined;
    // 시간 관련 부분 제거 (h, i 및 그 주변 문자들)
    return format.replace(/\s*h[:\s]*i[분]?/g, '').replace(/\s*h시\s*i분/g, '').trim();
  };

  // Helper to render date button
  const renderDateButton = (date: Date | undefined, isActive: boolean, onClick: () => void, isPlaceholder: boolean) => {
    const dateFormat = getDateOnlyFormat();

    if (isPlaceholder || !date) {
      // format이 있으면 placeholder도 포맷에 맞게 표시
      const placeholderText = dateFormat
        ? dateFormat.replace(/y/g, 'YYYY').replace(/m/g, 'MM').replace(/d/g, 'DD')
        : 'YYYY - MM - DD';

      return (
        <button
          type="button"
          className={`${styles.inputPart} ${isActive ? styles.active : ''} ${styles.placeholder}`}
          onClick={onClick}
        >
          {placeholderText}
        </button>
      );
    }

    // format prop이 있으면 사용 (날짜만)
    const displayText = dateFormat
      ? formatWithPattern(date, undefined, dateFormat)
      : `${date.getFullYear()} - ${String(date.getMonth() + 1).padStart(2, '0')} - ${String(date.getDate()).padStart(2, '0')}`;

    return (
      <button
        type="button"
        className={`${styles.inputPart} ${isActive ? styles.active : ''}`}
        onClick={onClick}
      >
        {displayText}
      </button>
    );
  };

  // Helper to render hour select
  const renderHourSelect = (time: TimeValue | undefined, part: SelectingPart, isPlaceholder: boolean) => {
    const hour = time?.hour ?? 0;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const isEnd = part === 'endHour';
    const currentDate = isEnd ? tempValue.endDate : tempValue.date;

    // minDate/maxDate 시간 제한 계산
    const minLimit = minDate ? extractDateTimeLimit(minDate) : null;
    const maxLimit = maxDate ? extractDateTimeLimit(maxDate) : null;

    const isHourDisabled = (h: number): boolean => {
      if (!currentDate) return false;

      // minDate와 같은 날짜인 경우
      if (minLimit?.time && isSameDay(currentDate, minLimit.date)) {
        if (h < minLimit.time.hour) return true;
      }
      // maxDate와 같은 날짜인 경우
      if (maxLimit?.time && isSameDay(currentDate, maxLimit.date)) {
        if (h > maxLimit.time.hour) return true;
      }
      return false;
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedHour = parseInt(e.target.value, 10);
      const currentTime = isEnd ? tempValue.endTime : tempValue.time;
      let newMinute = currentTime?.minute ?? 0;

      // 시간 변경 시 분이 범위를 벗어나면 자동 보정
      if (currentDate) {
        // minDate와 같은 날짜이고 선택한 시간이 minLimit 시간과 같은 경우
        if (minLimit?.time && isSameDay(currentDate, minLimit.date) && selectedHour === minLimit.time.hour) {
          if (newMinute < minLimit.time.minute) {
            // minuteStep에 맞춰 올림
            newMinute = Math.ceil(minLimit.time.minute / minuteStep) * minuteStep;
          }
        }
        // maxDate와 같은 날짜이고 선택한 시간이 maxLimit 시간과 같은 경우
        if (maxLimit?.time && isSameDay(currentDate, maxLimit.date) && selectedHour === maxLimit.time.hour) {
          if (newMinute > maxLimit.time.minute) {
            // minuteStep에 맞춰 내림
            newMinute = Math.floor(maxLimit.time.minute / minuteStep) * minuteStep;
          }
        }
      }

      // minuteStep에 맞지 않는 분 값 보정
      if (newMinute % minuteStep !== 0) {
        newMinute = Math.floor(newMinute / minuteStep) * minuteStep;
      }

      const newTime: TimeValue = { hour: selectedHour, minute: newMinute };

      const newValue = isEnd
        ? { ...tempValue, endTime: newTime }
        : { ...tempValue, time: newTime };
      setTempValue(newValue);
      if (!shouldShowActions) {
        onChange?.(newValue);
      }
    };

    return (
      <select
        className={`${styles.timeSelect} ${isPlaceholder ? styles.placeholder : ''}`}
        value={hour}
        onChange={handleChange}
        disabled={disabled}
      >
        {hours.map((h) => (
          <option key={h} value={h} disabled={isHourDisabled(h)}>
            {String(h).padStart(2, '0')}
          </option>
        ))}
      </select>
    );
  };

  // Helper to render minute select
  const renderMinuteSelect = (time: TimeValue | undefined, part: SelectingPart, isPlaceholder: boolean) => {
    const minute = time?.minute ?? 0;
    // minuteStep에 따라 분 옵션 생성 (0, step, step*2, ...)
    const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
    const isEnd = part === 'endMinute';
    const currentDate = isEnd ? tempValue.endDate : tempValue.date;
    const currentTime = isEnd ? tempValue.endTime : tempValue.time;

    // minDate/maxDate 시간 제한 계산
    const minLimit = minDate ? extractDateTimeLimit(minDate) : null;
    const maxLimit = maxDate ? extractDateTimeLimit(maxDate) : null;

    const isMinuteDisabled = (m: number): boolean => {
      if (!currentDate || !currentTime) return false;

      // minDate와 같은 날짜이고 같은 시간인 경우
      if (minLimit?.time && isSameDay(currentDate, minLimit.date) && currentTime.hour === minLimit.time.hour) {
        if (m < minLimit.time.minute) return true;
      }
      // maxDate와 같은 날짜이고 같은 시간인 경우
      if (maxLimit?.time && isSameDay(currentDate, maxLimit.date) && currentTime.hour === maxLimit.time.hour) {
        if (m > maxLimit.time.minute) return true;
      }
      return false;
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      let selectedMinute = parseInt(e.target.value, 10);
      const selectedHour = currentTime?.hour ?? 0;

      // 분 선택 시 범위 자동 보정
      if (currentDate) {
        // minDate와 같은 날짜이고 같은 시간인 경우
        if (minLimit?.time && isSameDay(currentDate, minLimit.date) && selectedHour === minLimit.time.hour) {
          if (selectedMinute < minLimit.time.minute) {
            // minuteStep에 맞춰 올림
            selectedMinute = Math.ceil(minLimit.time.minute / minuteStep) * minuteStep;
          }
        }
        // maxDate와 같은 날짜이고 같은 시간인 경우
        if (maxLimit?.time && isSameDay(currentDate, maxLimit.date) && selectedHour === maxLimit.time.hour) {
          if (selectedMinute > maxLimit.time.minute) {
            // minuteStep에 맞춰 내림
            selectedMinute = Math.floor(maxLimit.time.minute / minuteStep) * minuteStep;
          }
        }
      }

      const newTime: TimeValue = { hour: selectedHour, minute: selectedMinute };

      const newValue = isEnd
        ? { ...tempValue, endTime: newTime }
        : { ...tempValue, time: newTime };
      setTempValue(newValue);
      if (!shouldShowActions) {
        onChange?.(newValue);
      }
    };

    // 현재 값이 minuteStep에 맞지 않으면 가장 가까운 값으로 표시
    const displayMinute = minutes.includes(minute) ? minute : Math.floor(minute / minuteStep) * minuteStep;

    return (
      <select
        className={`${styles.timeSelect} ${isPlaceholder ? styles.placeholder : ''}`}
        value={displayMinute}
        onChange={handleChange}
        disabled={disabled}
      >
        {minutes.map((m) => (
          <option key={m} value={m} disabled={isMinuteDisabled(m)}>
            {String(m).padStart(2, '0')}
          </option>
        ))}
      </select>
    );
  };

  // Render input content with clickable parts
  const renderInputContent = () => {
    const hasStartTime = displayValue?.time !== undefined;
    const hasEndTime = displayValue?.endTime !== undefined;

    if (type === 'date') {
      if (mode === 'period') {
        return (
          <div className={styles.inputContent}>
            {renderDateButton(displayValue?.date, selectingPart === 'date', () => handlePartClick('date'), !hasStartValue)}
            <span className={styles.separator}>~</span>
            {renderDateButton(displayValue?.endDate, selectingPart === 'endDate', () => handlePartClick('endDate'), !hasEndValue)}
          </div>
        );
      }
      return (
        <div className={styles.inputContent}>
          {renderDateButton(displayValue?.date, selectingPart === 'date', () => handlePartClick('date'), !hasStartValue)}
        </div>
      );
    }

    if (type === 'time') {
      if (mode === 'period') {
        return (
          <div className={styles.inputContent}>
            <div className={styles.timeSection}>
              {renderHourSelect(displayValue?.time, 'hour', !hasStartTime)}
              <span className={styles.timeSeparator}>:</span>
              {renderMinuteSelect(displayValue?.time, 'minute', !hasStartTime)}
            </div>
            <span className={styles.separator}>~</span>
            <div className={styles.timeSection}>
              {renderHourSelect(displayValue?.endTime, 'endHour', !hasEndTime)}
              <span className={styles.timeSeparator}>:</span>
              {renderMinuteSelect(displayValue?.endTime, 'endMinute', !hasEndTime)}
            </div>
          </div>
        );
      }
      return (
        <div className={styles.inputContent}>
          <div className={styles.timeSection}>
            {renderHourSelect(displayValue?.time, 'hour', !hasStartTime)}
            <span className={styles.timeSeparator}>:</span>
            {renderMinuteSelect(displayValue?.time, 'minute', !hasStartTime)}
          </div>
        </div>
      );
    }

    // datetime
    if (mode === 'period') {
      return (
        <div className={styles.inputContent}>
          {renderDateButton(displayValue?.date, selectingPart === 'date', () => handlePartClick('date'), !hasStartValue)}
          <div className={styles.timeSection}>
            {renderHourSelect(displayValue?.time, 'hour', !hasStartTime)}
            <span className={styles.timeSeparator}>:</span>
            {renderMinuteSelect(displayValue?.time, 'minute', !hasStartTime)}
          </div>
          <span className={styles.separator}>~</span>
          {renderDateButton(displayValue?.endDate, selectingPart === 'endDate', () => handlePartClick('endDate'), !hasEndValue)}
          <div className={styles.timeSection}>
            {renderHourSelect(displayValue?.endTime, 'endHour', !hasEndTime)}
            <span className={styles.timeSeparator}>:</span>
            {renderMinuteSelect(displayValue?.endTime, 'endMinute', !hasEndTime)}
          </div>
        </div>
      );
    }
    return (
      <div className={styles.inputContent}>
        {renderDateButton(displayValue?.date, selectingPart === 'date', () => handlePartClick('date'), !hasStartValue)}
        <div className={styles.timeSection}>
          {renderHourSelect(displayValue?.time, 'hour', !hasStartTime)}
          <span className={styles.timeSeparator}>:</span>
          {renderMinuteSelect(displayValue?.time, 'minute', !hasStartTime)}
        </div>
      </div>
    );
  };

  // Render dropdown content based on selecting part
  const renderDropdownContent = () => {
    // 날짜 선택만 드롭다운으로 표시 (시/분은 native select 사용)
    if (selectingPart === 'date' || selectingPart === 'endDate') {
      // period 모드: 두 개의 달력을 나란히 표시
      if (mode === 'period') {
        return (
          <PeriodCalendar
            value={tempValue.date}
            endValue={tempValue.endDate}
            onSelect={handleDateSelect}
            viewDate={viewDate}
            endViewDate={endViewDate}
            onViewDateChange={setViewDate}
            onEndViewDateChange={setEndViewDate}
            disable={disable}
            enable={enable}
            minDate={minDate}
            maxDate={maxDate}
            yearRange={yearRange}
          />
        );
      }
      // instant 모드: 단일 달력
      return (
        <Calendar
          value={tempValue.date}
          endValue={tempValue.endDate}
          mode={mode}
          onSelect={handleDateSelect}
          viewDate={viewDate}
          onViewDateChange={setViewDate}
          disable={disable}
          enable={enable}
          minDate={minDate}
          maxDate={maxDate}
          yearRange={yearRange}
        />
      );
    }

    return null;
  };

  // 아이콘 결정 (time 타입은 icon-time, 나머지는 icon-calendar)
  const inputIcon = type === 'time' ? 'icon-time' : 'icon-calendar';

  return (
    <div ref={containerRef} className={`${styles.datepicker} ${className || ''}`}>
      <div
        className={`${styles.input} ${isOpen ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
      >
        {renderInputContent()}
        <i className={`${styles.inputIcon} ${inputIcon}`} />
      </div>

      {isOpen && (
        <div className={`${styles.dropdown} ${align === 'right' ? styles.right : ''}`}>
          {renderDropdownContent()}

          {shouldShowActions && (
            <div className={styles.bottomActions}>
              <span className={styles.periodText}>
                {mode === 'period' && tempValue.date ? formatPeriodText() : ''}
              </span>
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.reset}`}
                  onClick={handleReset}
                >
                  <i className="icon-refresh" />
                  초기화
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.apply}`}
                  onClick={handleApply}
                >
                  적용
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
