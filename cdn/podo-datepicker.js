/*!
 * Podo UI DatePicker v0.9.5
 * https://podoui.com
 * MIT License
 */
/**
 * Podo UI DatePicker - Vanilla JS
 * A pure JavaScript date picker component without dependencies
 *
 * @version 0.8.0
 * @license MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
      ? define(factory)
      : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self),
        (global.PodoDatePicker = factory()));
})(this, function () {
  'use strict';

  // CSS class prefix
  const PREFIX = 'podo-datepicker';

  // Default texts (Korean)
  const DEFAULT_TEXTS = {
    weekDays: ['일', '월', '화', '수', '목', '금', '토'],
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    yearSuffix: '년',
    reset: '초기화',
    apply: '적용',
  };

  // ============================================
  // Helper Functions
  // ============================================

  /**
   * CalendarInitial 값을 Date로 변환
   * @param {string|Date|undefined} initial - 'now', 'prevMonth', 'nextMonth', or Date
   * @param {Date} fallback - 기본값
   * @returns {Date}
   */
  function resolveCalendarInitial(initial, fallback) {
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
  }

  /**
   * 커스텀 포맷으로 날짜/시간 포맷팅
   * y: 년(4자리), m: 월(2자리), d: 일(2자리), h: 시(2자리), i: 분(2자리)
   * @param {Date|undefined} date
   * @param {Object|undefined} time - { hour, minute }
   * @param {string} pattern
   * @returns {string}
   */
  function formatWithPattern(date, time, pattern) {
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
  }

  /**
   * 날짜만 표시하는 포맷 추출 (시간 부분 제거)
   * @param {string|undefined} format
   * @returns {string|undefined}
   */
  function getDateOnlyFormat(format) {
    if (!format) return undefined;
    return format.replace(/\s*h[:\s]*i[분]?/g, '').replace(/\s*h시\s*i분/g, '').trim();
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year} - ${month} - ${day}`;
  }

  function formatTime(hour, minute) {
    return `${String(hour).padStart(2, '0')} : ${String(minute).padStart(2, '0')}`;
  }

  function isSameDay(date1, date2) {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  function isInRange(date, start, end) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return d >= s && d <= e;
  }

  function isInRangeExclusive(date, start, end) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return d > s && d < e;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function isDateRange(condition) {
    return typeof condition === 'object' && condition !== null && 'from' in condition && 'to' in condition;
  }

  function matchesCondition(date, condition) {
    if (typeof condition === 'function') {
      return condition(date);
    }
    if (isDateRange(condition)) {
      return isInRange(date, condition.from, condition.to);
    }
    // Date type
    return isSameDay(date, condition);
  }

  function isDateDisabled(date, disable, enable) {
    // If enable is specified: disable if not matching any condition
    if (enable && enable.length > 0) {
      const isEnabled = enable.some((condition) => matchesCondition(date, condition));
      return !isEnabled;
    }

    // If disable is specified: disable if matching any condition
    if (disable && disable.length > 0) {
      return disable.some((condition) => matchesCondition(date, condition));
    }

    return false;
  }

  function isDateTimeLimit(value) {
    return typeof value === 'object' && value !== null && 'date' in value && !(value instanceof Date);
  }

  function extractDateTimeLimit(limit) {
    if (isDateTimeLimit(limit)) {
      return { date: limit.date, time: limit.time };
    }
    return { date: limit };
  }

  function isBeforeMinDate(date, minDate) {
    if (!minDate) return false;
    const { date: minDateValue } = extractDateTimeLimit(minDate);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const m = new Date(minDateValue.getFullYear(), minDateValue.getMonth(), minDateValue.getDate());
    return d < m;
  }

  function isAfterMaxDate(date, maxDate) {
    if (!maxDate) return false;
    const { date: maxDateValue } = extractDateTimeLimit(maxDate);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const m = new Date(maxDateValue.getFullYear(), maxDateValue.getMonth(), maxDateValue.getDate());
    return d > m;
  }

  function createElement(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content !== undefined) {
      if (typeof content === 'string' || typeof content === 'number') {
        el.textContent = content;
      } else if (content instanceof HTMLElement) {
        el.appendChild(content);
      }
    }
    return el;
  }

  // ============================================
  // PodoDatePicker Class
  // ============================================

  class PodoDatePicker {
    /**
     * @param {HTMLElement|string} container - Container element or selector
     * @param {Object} options - DatePicker options
     * @param {string} [options.mode='instant'] - 'instant' or 'period'
     * @param {string} [options.type='date'] - 'date', 'time', or 'datetime'
     * @param {Object} [options.value] - Initial value { date, time, endDate, endTime }
     * @param {Function} [options.onChange] - Change callback
     * @param {string} [options.placeholder] - Placeholder text
     * @param {boolean} [options.disabled=false] - Disabled state
     * @param {boolean} [options.showActions] - Show action buttons
     * @param {string} [options.align='left'] - Dropdown alignment 'left' or 'right'
     * @param {Array} [options.disable] - Disable conditions
     * @param {Array} [options.enable] - Enable conditions (only these dates are selectable)
     * @param {Date|Object} [options.minDate] - Minimum selectable date
     * @param {Date|Object} [options.maxDate] - Maximum selectable date
     * @param {number} [options.minuteStep=1] - Minute step (1, 5, 10, 15, 20, 30)
     * @param {Object} [options.texts] - Custom texts for localization
     * @param {string} [options.format] - Date/time format (y: year, m: month, d: day, h: hour, i: minute)
     * @param {Object} [options.initialCalendar] - Initial calendar display month { start, end }
     */
    constructor(container, options = {}) {
      this.container =
        typeof container === 'string' ? document.querySelector(container) : container;

      if (!this.container) {
        throw new Error('PodoDatePicker: Container element not found');
      }

      // Options
      this.mode = options.mode || 'instant';
      this.type = options.type || 'date';
      this.value = options.value || {};
      this.tempValue = { ...this.value };
      this.onChange = options.onChange;
      this.placeholder = options.placeholder;
      this.disabled = options.disabled || false;
      this.showActions = options.showActions ?? this.mode === 'period';
      this.align = options.align || 'left';
      this.disable = options.disable || [];
      this.enable = options.enable || [];
      this.minDate = options.minDate;
      this.maxDate = options.maxDate;
      this.minuteStep = options.minuteStep || 1;
      this.texts = { ...DEFAULT_TEXTS, ...options.texts };
      this.format = options.format;
      this.initialCalendar = options.initialCalendar || {};

      // State
      this.isOpen = false;
      this.selectingPart = null;

      // 초기 달력 표시 월 계산
      if (this.value.date) {
        this.viewDate = new Date(this.value.date);
      } else if (this.initialCalendar.start) {
        this.viewDate = resolveCalendarInitial(this.initialCalendar.start, new Date());
      } else {
        this.viewDate = new Date();
      }

      if (this.value.endDate) {
        this.endViewDate = new Date(
          this.value.endDate.getFullYear(),
          this.value.endDate.getMonth() + 1,
          1
        );
      } else if (this.initialCalendar.end) {
        this.endViewDate = resolveCalendarInitial(this.initialCalendar.end, new Date());
      } else {
        this.endViewDate = new Date(
          this.viewDate.getFullYear(),
          this.viewDate.getMonth() + 1,
          1
        );
      }

      // Build UI
      this.render();
      this.bindEvents();
    }

    // ============================================
    // Rendering
    // ============================================

    render() {
      this.container.innerHTML = '';
      this.container.className = PREFIX;

      // Input wrapper
      this.inputEl = createElement('div', `${PREFIX}__input`);
      if (this.disabled) this.inputEl.classList.add(`${PREFIX}__input--disabled`);

      this.inputContentEl = createElement('div', `${PREFIX}__input-content`);
      this.renderInputContent();
      this.inputEl.appendChild(this.inputContentEl);

      // Icon
      const iconClass = this.type === 'time' ? 'icon-time' : 'icon-calendar';
      this.iconEl = createElement('i', `${PREFIX}__icon ${iconClass}`);
      this.inputEl.appendChild(this.iconEl);

      this.container.appendChild(this.inputEl);

      // Dropdown
      this.dropdownEl = createElement(
        'div',
        `${PREFIX}__dropdown ${this.align === 'right' ? `${PREFIX}__dropdown--right` : ''}`
      );
      this.dropdownEl.style.display = 'none';
      this.container.appendChild(this.dropdownEl);
    }

    renderInputContent() {
      this.inputContentEl.innerHTML = '';
      const displayValue = this.showActions ? this.tempValue : this.value;

      if (this.type === 'date') {
        this.renderDateInput(displayValue);
      } else if (this.type === 'time') {
        this.renderTimeInput(displayValue);
      } else {
        // datetime
        this.renderDateTimeInput(displayValue);
      }
    }

    renderDateInput(displayValue) {
      // Start date button
      this.startDateBtn = this.createDateButton(displayValue.date, 'date');
      this.inputContentEl.appendChild(this.startDateBtn);

      if (this.mode === 'period') {
        const sep = createElement('span', `${PREFIX}__separator`, '~');
        this.inputContentEl.appendChild(sep);

        this.endDateBtn = this.createDateButton(displayValue.endDate, 'endDate');
        this.inputContentEl.appendChild(this.endDateBtn);
      }
    }

    renderTimeInput(displayValue) {
      const startTimeSection = this.createTimeSection(displayValue.time, 'hour', 'minute');
      this.inputContentEl.appendChild(startTimeSection);

      if (this.mode === 'period') {
        const sep = createElement('span', `${PREFIX}__separator`, '~');
        this.inputContentEl.appendChild(sep);

        const endTimeSection = this.createTimeSection(displayValue.endTime, 'endHour', 'endMinute');
        this.inputContentEl.appendChild(endTimeSection);
      }
    }

    renderDateTimeInput(displayValue) {
      // Start date
      this.startDateBtn = this.createDateButton(displayValue.date, 'date');
      this.inputContentEl.appendChild(this.startDateBtn);

      // Start time
      const startTimeSection = this.createTimeSection(displayValue.time, 'hour', 'minute');
      this.inputContentEl.appendChild(startTimeSection);

      if (this.mode === 'period') {
        const sep = createElement('span', `${PREFIX}__separator`, '~');
        this.inputContentEl.appendChild(sep);

        // End date
        this.endDateBtn = this.createDateButton(displayValue.endDate, 'endDate');
        this.inputContentEl.appendChild(this.endDateBtn);

        // End time
        const endTimeSection = this.createTimeSection(displayValue.endTime, 'endHour', 'endMinute');
        this.inputContentEl.appendChild(endTimeSection);
      }
    }

    createDateButton(date, part) {
      const btn = createElement('button', `${PREFIX}__part`);
      btn.type = 'button';

      const dateFormat = getDateOnlyFormat(this.format);

      if (!date) {
        btn.classList.add(`${PREFIX}__part--placeholder`);
        // format이 있으면 placeholder도 포맷에 맞게 표시
        const placeholderText = dateFormat
          ? dateFormat.replace(/y/g, 'YYYY').replace(/m/g, 'MM').replace(/d/g, 'DD')
          : 'YYYY - MM - DD';
        btn.textContent = placeholderText;
      } else {
        // format prop이 있으면 사용 (날짜만)
        const displayText = dateFormat
          ? formatWithPattern(date, null, dateFormat)
          : formatDate(date);
        btn.textContent = displayText;
      }
      btn.dataset.part = part;
      return btn;
    }

    createTimeSection(time, hourPart, minutePart) {
      const section = createElement('div', `${PREFIX}__time-section`);

      // Hour select
      const hourSelect = this.createHourSelect(time, hourPart);
      section.appendChild(hourSelect);

      const sep = createElement('span', `${PREFIX}__time-separator`, ':');
      section.appendChild(sep);

      // Minute select
      const minuteSelect = this.createMinuteSelect(time, minutePart);
      section.appendChild(minuteSelect);

      return section;
    }

    createHourSelect(time, part) {
      const select = createElement('select', `${PREFIX}__time-select`);
      if (!time) select.classList.add(`${PREFIX}__time-select--placeholder`);
      if (this.disabled) select.disabled = true;

      const isEnd = part === 'endHour';
      const currentDate = isEnd ? this.tempValue.endDate : this.tempValue.date;

      for (let h = 0; h < 24; h++) {
        const opt = createElement('option', null, String(h).padStart(2, '0'));
        opt.value = h;

        // Check hour disabled by minDate/maxDate
        if (this.isHourDisabled(h, currentDate)) {
          opt.disabled = true;
        }

        select.appendChild(opt);
      }

      select.value = time?.hour ?? 0;
      select.dataset.part = part;
      return select;
    }

    createMinuteSelect(time, part) {
      const select = createElement('select', `${PREFIX}__time-select`);
      if (!time) select.classList.add(`${PREFIX}__time-select--placeholder`);
      if (this.disabled) select.disabled = true;

      const isEnd = part === 'endMinute';
      const currentDate = isEnd ? this.tempValue.endDate : this.tempValue.date;
      const currentTime = isEnd ? this.tempValue.endTime : this.tempValue.time;

      for (let m = 0; m < 60; m += this.minuteStep) {
        const opt = createElement('option', null, String(m).padStart(2, '0'));
        opt.value = m;

        // Check minute disabled
        if (this.isMinuteDisabled(m, currentDate, currentTime)) {
          opt.disabled = true;
        }

        select.appendChild(opt);
      }

      let minute = time?.minute ?? 0;
      // Adjust to valid minute step
      if (minute % this.minuteStep !== 0) {
        minute = Math.floor(minute / this.minuteStep) * this.minuteStep;
      }
      select.value = minute;
      select.dataset.part = part;
      return select;
    }

    isHourDisabled(h, currentDate) {
      if (!currentDate) return false;

      const minLimit = this.minDate ? extractDateTimeLimit(this.minDate) : null;
      const maxLimit = this.maxDate ? extractDateTimeLimit(this.maxDate) : null;

      if (minLimit?.time && isSameDay(currentDate, minLimit.date)) {
        if (h < minLimit.time.hour) return true;
      }
      if (maxLimit?.time && isSameDay(currentDate, maxLimit.date)) {
        if (h > maxLimit.time.hour) return true;
      }
      return false;
    }

    isMinuteDisabled(m, currentDate, currentTime) {
      if (!currentDate || !currentTime) return false;

      const minLimit = this.minDate ? extractDateTimeLimit(this.minDate) : null;
      const maxLimit = this.maxDate ? extractDateTimeLimit(this.maxDate) : null;

      if (minLimit?.time && isSameDay(currentDate, minLimit.date) && currentTime.hour === minLimit.time.hour) {
        if (m < minLimit.time.minute) return true;
      }
      if (maxLimit?.time && isSameDay(currentDate, maxLimit.date) && currentTime.hour === maxLimit.time.hour) {
        if (m > maxLimit.time.minute) return true;
      }
      return false;
    }

    renderDropdown() {
      this.dropdownEl.innerHTML = '';

      // Calendar(s)
      if (this.mode === 'period') {
        this.renderPeriodCalendars();
      } else {
        this.renderCalendar(this.viewDate, (date) => this.handleViewDateChange(date));
      }

      // Action buttons
      if (this.showActions) {
        this.renderActions();
      }
    }

    renderCalendar(viewDate, onViewDateChange, opts = {}) {
      const calendar = createElement('div', `${PREFIX}__calendar`);

      // Navigation
      const nav = this.renderCalendarNav(viewDate, onViewDateChange, opts);
      calendar.appendChild(nav);

      // Grid
      const grid = this.renderCalendarGrid(viewDate);
      calendar.appendChild(grid);

      this.dropdownEl.appendChild(calendar);
      return calendar;
    }

    renderPeriodCalendars() {
      const wrapper = createElement('div', `${PREFIX}__period-calendars`);

      // Left calendar
      const leftCal = createElement('div', `${PREFIX}__period-calendar-left`);
      const leftCalendar = this.createCalendarElement(
        this.viewDate,
        (date) => this.handleViewDateChange(date),
        { maxViewDate: this.endViewDate }
      );
      leftCal.appendChild(leftCalendar);
      wrapper.appendChild(leftCal);

      // Right calendar
      const rightCal = createElement('div', `${PREFIX}__period-calendar-right`);
      const rightCalendar = this.createCalendarElement(
        this.endViewDate,
        (date) => this.handleEndViewDateChange(date),
        { minViewDate: this.viewDate }
      );
      rightCal.appendChild(rightCalendar);
      wrapper.appendChild(rightCal);

      this.dropdownEl.appendChild(wrapper);
    }

    createCalendarElement(viewDate, onViewDateChange, opts = {}) {
      const calendar = createElement('div', `${PREFIX}__calendar`);

      // Navigation
      const nav = this.renderCalendarNav(viewDate, onViewDateChange, opts);
      calendar.appendChild(nav);

      // Grid
      const grid = this.renderCalendarGrid(viewDate);
      calendar.appendChild(grid);

      return calendar;
    }

    renderCalendarNav(viewDate, onViewDateChange, opts = {}) {
      const nav = createElement('div', `${PREFIX}__calendar-nav`);
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();

      // Calculate navigation limits
      const minViewDate = opts.minViewDate;
      const maxViewDate = opts.maxViewDate;

      const minYear = minViewDate?.getFullYear();
      const minMonth = minViewDate?.getMonth();
      const maxYear = maxViewDate?.getFullYear();
      const maxMonth = maxViewDate?.getMonth();

      const isPrevDisabled = minViewDate
        ? year < minYear || (year === minYear && month <= minMonth)
        : false;
      const isNextDisabled = maxViewDate
        ? year > maxYear || (year === maxYear && month >= maxMonth)
        : false;

      // Prev button
      const prevBtn = createElement('button', `${PREFIX}__nav-button`);
      prevBtn.type = 'button';
      prevBtn.innerHTML = '<i class="icon-expand-left"></i>';
      if (isPrevDisabled) prevBtn.disabled = true;
      prevBtn.addEventListener('click', () => {
        if (!isPrevDisabled) {
          onViewDateChange(new Date(year, month - 1, 1));
          this.renderDropdown();
        }
      });
      nav.appendChild(prevBtn);

      // Title (Year/Month selects)
      const title = createElement('div', `${PREFIX}__nav-title`);

      // Year select
      const yearWrapper = createElement('div', `${PREFIX}__nav-select-wrapper`);
      const yearSelect = createElement('select', `${PREFIX}__nav-select`);
      const currentYear = new Date().getFullYear();
      for (let y = currentYear - 10; y <= currentYear + 10; y++) {
        if (minYear !== undefined && y < minYear) continue;
        if (maxYear !== undefined && y > maxYear) continue;
        const opt = createElement('option', null, `${y}${this.texts.yearSuffix}`);
        opt.value = y;
        yearSelect.appendChild(opt);
      }
      yearSelect.value = year;
      yearSelect.addEventListener('change', (e) => {
        onViewDateChange(new Date(parseInt(e.target.value), month, 1));
        this.renderDropdown();
      });
      yearWrapper.appendChild(yearSelect);
      title.appendChild(yearWrapper);

      // Month select
      const monthWrapper = createElement('div', `${PREFIX}__nav-select-wrapper`);
      const monthSelect = createElement('select', `${PREFIX}__nav-select`);
      for (let m = 0; m < 12; m++) {
        // Filter based on view limits
        if (minYear !== undefined && minMonth !== undefined && year === minYear && m < minMonth) continue;
        if (maxYear !== undefined && maxMonth !== undefined && year === maxYear && m > maxMonth) continue;
        const opt = createElement('option', null, this.texts.months[m]);
        opt.value = m;
        monthSelect.appendChild(opt);
      }
      monthSelect.value = month;
      monthSelect.addEventListener('change', (e) => {
        onViewDateChange(new Date(year, parseInt(e.target.value), 1));
        this.renderDropdown();
      });
      monthWrapper.appendChild(monthSelect);
      title.appendChild(monthWrapper);

      nav.appendChild(title);

      // Next button
      const nextBtn = createElement('button', `${PREFIX}__nav-button`);
      nextBtn.type = 'button';
      nextBtn.innerHTML = '<i class="icon-expand-right"></i>';
      if (isNextDisabled) nextBtn.disabled = true;
      nextBtn.addEventListener('click', () => {
        if (!isNextDisabled) {
          onViewDateChange(new Date(year, month + 1, 1));
          this.renderDropdown();
        }
      });
      nav.appendChild(nextBtn);

      return nav;
    }

    renderCalendarGrid(viewDate) {
      const grid = createElement('div', `${PREFIX}__calendar-grid`);
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const today = new Date();

      // Week days header
      const headerRow = createElement('div', `${PREFIX}__calendar-row`);
      this.texts.weekDays.forEach((day) => {
        const cell = createElement('div', `${PREFIX}__calendar-cell ${PREFIX}__calendar-cell--header`, day);
        headerRow.appendChild(cell);
      });
      grid.appendChild(headerRow);

      // Days
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      const prevMonthDays = getDaysInMonth(year, month - 1);

      let days = [];

      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const date = new Date(year, month - 1, day);
        days.push({ day, date, isOther: true });
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        days.push({ day, date, isOther: false });
      }

      // Next month days
      const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
      const remainingDays = totalCells - (firstDay + daysInMonth);
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day);
        days.push({ day, date, isOther: true });
      }

      // Render rows
      for (let i = 0; i < days.length; i += 7) {
        const row = createElement('div', `${PREFIX}__calendar-row`);
        for (let j = 0; j < 7 && i + j < days.length; j++) {
          const { day, date, isOther } = days[i + j];
          const cell = this.createDayCell(day, date, isOther, today);
          row.appendChild(cell);
        }
        grid.appendChild(row);
      }

      return grid;
    }

    createDayCell(day, date, isOther, today) {
      const cell = createElement('button', `${PREFIX}__calendar-cell`);
      cell.type = 'button';
      cell.textContent = day;

      // Check if disabled
      const isDisabled = this.checkDateDisabled(date);

      if (isOther) cell.classList.add(`${PREFIX}__calendar-cell--other`);
      if (isDisabled) {
        cell.classList.add(`${PREFIX}__calendar-cell--disabled`);
        cell.disabled = true;
      }

      // Check states
      const isToday = isSameDay(date, today);
      const isSelected = this.mode === 'instant' && isSameDay(date, this.tempValue.date);
      const isRangeStart = this.mode === 'period' && isSameDay(date, this.tempValue.date);
      const isRangeEnd = this.mode === 'period' && isSameDay(date, this.tempValue.endDate);
      const isInRangeDay =
        this.mode === 'period' &&
        this.tempValue.date &&
        this.tempValue.endDate &&
        isInRangeExclusive(date, this.tempValue.date, this.tempValue.endDate);

      if (isToday && !isSelected && !isRangeStart && !isRangeEnd) {
        cell.classList.add(`${PREFIX}__calendar-cell--today`);
      }
      if (isSelected) cell.classList.add(`${PREFIX}__calendar-cell--selected`);
      if (isRangeStart) cell.classList.add(`${PREFIX}__calendar-cell--range-start`);
      if (isRangeEnd) cell.classList.add(`${PREFIX}__calendar-cell--range-end`);
      if (isInRangeDay) cell.classList.add(`${PREFIX}__calendar-cell--in-range`);

      if (!isDisabled) {
        cell.addEventListener('click', () => this.handleDateSelect(date));
      }

      return cell;
    }

    checkDateDisabled(date) {
      if (isDateDisabled(date, this.disable, this.enable)) return true;
      if (isBeforeMinDate(date, this.minDate)) return true;
      if (isAfterMaxDate(date, this.maxDate)) return true;
      return false;
    }

    renderActions() {
      const actions = createElement('div', `${PREFIX}__actions`);

      // Period text
      const periodText = createElement('span', `${PREFIX}__period-text`);
      if (this.mode === 'period' && this.tempValue.date) {
        periodText.textContent = this.formatPeriodText();
      }
      actions.appendChild(periodText);

      // Buttons
      const buttons = createElement('div', `${PREFIX}__action-buttons`);

      // Reset button
      const resetBtn = createElement('button', `${PREFIX}__action-button ${PREFIX}__action-button--reset`);
      resetBtn.type = 'button';
      resetBtn.innerHTML = `<i class="icon-refresh"></i>${this.texts.reset}`;
      resetBtn.addEventListener('click', () => this.handleReset());
      buttons.appendChild(resetBtn);

      // Apply button
      const applyBtn = createElement('button', `${PREFIX}__action-button ${PREFIX}__action-button--apply`);
      applyBtn.type = 'button';
      applyBtn.textContent = this.texts.apply;
      applyBtn.addEventListener('click', () => this.handleApply());
      buttons.appendChild(applyBtn);

      actions.appendChild(buttons);
      this.dropdownEl.appendChild(actions);
    }

    formatPeriodText() {
      if (!this.tempValue.date) return '';

      // format prop이 있으면 사용
      if (this.format) {
        const startText = formatWithPattern(this.tempValue.date, this.tempValue.time, this.format);
        if (this.tempValue.endDate) {
          const endText = formatWithPattern(this.tempValue.endDate, this.tempValue.endTime, this.format);
          return `${startText} ~ ${endText}`;
        }
        return startText;
      }

      // 기본 포맷 (한국어)
      const formatKoreanDateTime = (date, time) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        let dateStr = `${year}년 ${month}월 ${day}일`;
        if (this.type === 'datetime' && time) {
          const hours = String(time.hour).padStart(2, '0');
          const minutes = String(time.minute).padStart(2, '0');
          dateStr += ` ${hours}:${minutes}`;
        }
        return dateStr;
      };

      const startText = formatKoreanDateTime(this.tempValue.date, this.tempValue.time);
      if (this.tempValue.endDate) {
        const endText = formatKoreanDateTime(this.tempValue.endDate, this.tempValue.endTime);
        return `${startText} ~ ${endText}`;
      }
      return startText;
    }

    // ============================================
    // Event Handling
    // ============================================

    bindEvents() {
      // Input click - open dropdown for date parts
      this.inputEl.addEventListener('click', (e) => {
        if (this.disabled) return;

        const target = e.target;
        if (target.dataset.part === 'date' || target.dataset.part === 'endDate') {
          this.toggleDropdown(target.dataset.part);
        }
      });

      // Time select changes
      this.inputContentEl.addEventListener('change', (e) => {
        if (e.target.tagName !== 'SELECT') return;

        const part = e.target.dataset.part;
        const value = parseInt(e.target.value);

        this.handleTimeChange(part, value);
      });

      // Close on outside click
      document.addEventListener('mousedown', (e) => {
        if (!this.container.contains(e.target) && this.isOpen) {
          this.close();
        }
      });
    }

    toggleDropdown(part) {
      if (this.selectingPart === part && this.isOpen) {
        this.close();
      } else {
        this.selectingPart = part;
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.inputEl.classList.add(`${PREFIX}__input--active`);
      this.dropdownEl.style.display = 'flex';
      this.renderDropdown();
    }

    close() {
      this.isOpen = false;
      this.selectingPart = null;
      this.inputEl.classList.remove(`${PREFIX}__input--active`);
      this.dropdownEl.style.display = 'none';
    }

    handleViewDateChange(date) {
      this.viewDate = date;
    }

    handleEndViewDateChange(date) {
      this.endViewDate = date;
    }

    handleDateSelect(date) {
      const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (this.mode === 'instant') {
        const adjustedTime = this.adjustTimeForDate(newDate, this.tempValue.time);
        this.tempValue = { ...this.tempValue, date: newDate, time: adjustedTime };

        if (!this.showActions) {
          this.value = { ...this.tempValue };
          this.emitChange();
        }

        this.close();
        this.renderInputContent();
        return;
      }

      // Period mode logic
      const existingStartDate = this.tempValue.date;
      const existingEndDate = this.tempValue.endDate;

      if (!existingStartDate) {
        const adjustedTime = this.adjustTimeForDate(newDate, this.tempValue.time);
        this.tempValue = { ...this.tempValue, date: newDate, time: adjustedTime };
      } else if (!existingEndDate) {
        const dateOnly = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        const startDateOnly = new Date(
          existingStartDate.getFullYear(),
          existingStartDate.getMonth(),
          existingStartDate.getDate()
        );

        if (dateOnly < startDateOnly) {
          const adjustedStartTime = this.adjustTimeForDate(newDate, this.tempValue.time);
          const adjustedEndTime = this.adjustTimeForDate(existingStartDate, this.tempValue.time);
          this.tempValue = {
            date: newDate,
            time: adjustedStartTime,
            endDate: existingStartDate,
            endTime: adjustedEndTime,
          };
        } else {
          const adjustedEndTime = this.adjustTimeForDate(newDate, this.tempValue.endTime);
          this.tempValue = { ...this.tempValue, endDate: newDate, endTime: adjustedEndTime };
        }
      } else {
        const adjustedTime = this.adjustTimeForDate(newDate, this.tempValue.time);
        this.tempValue = { date: newDate, time: adjustedTime, endDate: undefined, endTime: undefined };
      }

      this.renderDropdown();
      this.renderInputContent();
    }

    adjustTimeForDate(date, time) {
      if (!time) return time;

      const minLimit = this.minDate ? extractDateTimeLimit(this.minDate) : null;
      const maxLimit = this.maxDate ? extractDateTimeLimit(this.maxDate) : null;

      let adjustedHour = time.hour;
      let adjustedMinute = time.minute;

      if (minLimit?.time && isSameDay(date, minLimit.date)) {
        if (adjustedHour < minLimit.time.hour) {
          adjustedHour = minLimit.time.hour;
          adjustedMinute = Math.ceil(minLimit.time.minute / this.minuteStep) * this.minuteStep;
        } else if (adjustedHour === minLimit.time.hour && adjustedMinute < minLimit.time.minute) {
          adjustedMinute = Math.ceil(minLimit.time.minute / this.minuteStep) * this.minuteStep;
        }
      }

      if (maxLimit?.time && isSameDay(date, maxLimit.date)) {
        if (adjustedHour > maxLimit.time.hour) {
          adjustedHour = maxLimit.time.hour;
          adjustedMinute = Math.floor(maxLimit.time.minute / this.minuteStep) * this.minuteStep;
        } else if (adjustedHour === maxLimit.time.hour && adjustedMinute > maxLimit.time.minute) {
          adjustedMinute = Math.floor(maxLimit.time.minute / this.minuteStep) * this.minuteStep;
        }
      }

      if (adjustedHour !== time.hour || adjustedMinute !== time.minute) {
        return { hour: adjustedHour, minute: adjustedMinute };
      }
      return time;
    }

    handleTimeChange(part, value) {
      const isEnd = part === 'endHour' || part === 'endMinute';
      const isHour = part === 'hour' || part === 'endHour';

      const currentTime = isEnd ? this.tempValue.endTime : this.tempValue.time;
      let newTime = { hour: currentTime?.hour ?? 0, minute: currentTime?.minute ?? 0 };

      if (isHour) {
        newTime.hour = value;
        // Auto-adjust minute if needed
        const currentDate = isEnd ? this.tempValue.endDate : this.tempValue.date;
        if (currentDate) {
          const minLimit = this.minDate ? extractDateTimeLimit(this.minDate) : null;
          const maxLimit = this.maxDate ? extractDateTimeLimit(this.maxDate) : null;

          if (minLimit?.time && isSameDay(currentDate, minLimit.date) && value === minLimit.time.hour) {
            if (newTime.minute < minLimit.time.minute) {
              newTime.minute = Math.ceil(minLimit.time.minute / this.minuteStep) * this.minuteStep;
            }
          }
          if (maxLimit?.time && isSameDay(currentDate, maxLimit.date) && value === maxLimit.time.hour) {
            if (newTime.minute > maxLimit.time.minute) {
              newTime.minute = Math.floor(maxLimit.time.minute / this.minuteStep) * this.minuteStep;
            }
          }
        }
      } else {
        newTime.minute = value;
      }

      if (isEnd) {
        this.tempValue = { ...this.tempValue, endTime: newTime };
      } else {
        this.tempValue = { ...this.tempValue, time: newTime };
      }

      if (!this.showActions) {
        this.value = { ...this.tempValue };
        this.emitChange();
      }

      this.renderInputContent();
    }

    handleReset() {
      this.tempValue = {};
      this.close();
      this.renderInputContent();
    }

    handleApply() {
      this.value = { ...this.tempValue };
      this.emitChange();
      this.close();
      this.renderInputContent();
    }

    emitChange() {
      if (this.onChange) {
        this.onChange(this.value);
      }
    }

    // ============================================
    // Public API
    // ============================================

    /**
     * Get current value
     * @returns {Object} Current value
     */
    getValue() {
      return { ...this.value };
    }

    /**
     * Set value programmatically
     * @param {Object} value - New value
     */
    setValue(value) {
      this.value = value || {};
      this.tempValue = { ...this.value };
      if (value?.date) {
        this.viewDate = new Date(value.date);
      }
      if (value?.endDate) {
        this.endViewDate = new Date(value.endDate.getFullYear(), value.endDate.getMonth() + 1, 1);
      }
      this.renderInputContent();
    }

    /**
     * Clear value
     */
    clear() {
      this.value = {};
      this.tempValue = {};
      this.renderInputContent();
      this.emitChange();
    }

    /**
     * Enable the datepicker
     */
    enable() {
      this.disabled = false;
      this.inputEl.classList.remove(`${PREFIX}__input--disabled`);
      this.renderInputContent();
    }

    /**
     * Disable the datepicker
     */
    disable() {
      this.disabled = true;
      this.inputEl.classList.add(`${PREFIX}__input--disabled`);
      this.close();
      this.renderInputContent();
    }

    /**
     * Destroy the datepicker instance
     */
    destroy() {
      this.container.innerHTML = '';
    }
  }

  return PodoDatePicker;
});
