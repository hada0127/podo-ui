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
}
type $$ComponentProps = Props & Record<string, unknown>;
declare const DatePicker: import("svelte").Component<$$ComponentProps, {}, "value">;
type DatePicker = ReturnType<typeof DatePicker>;
export default DatePicker;
