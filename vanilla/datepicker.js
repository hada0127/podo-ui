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
    quickSelect: {
      today: '오늘',
      yesterday: '어제',
      thisWeek: '이번 주',
      lastWeek: '지난 주',
      last7Days: '최근 7일',
      last30Days: '최근 30일',
      thisMonth: '이번 달',
      lastMonth: '지난 달',
    },
  };

  // ============================================
  // Quick Select Presets
  // ============================================

  const QUICK_SELECT_KEYS = [
    'today', 'yesterday', 'thisWeek', 'lastWeek',
    'last7Days', 'last30Days', 'thisMonth', 'lastMonth',
  ];

  function getPresetRange(key) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    switch (key) {
      case 'today':
        return { start: new Date(todayStart), end: new Date(todayStart) };
      case 'yesterday': {
        const d = new Date(todayStart);
        d.setDate(d.getDate() - 1);
        return { start: d, end: new Date(d) };
      }
      case 'thisWeek': {
        const dayOfWeek = todayStart.getDay();
        const start = new Date(todayStart);
        start.setDate(start.getDate() - dayOfWeek);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return { start, end };
      }
      case 'lastWeek': {
        const dayOfWeek = todayStart.getDay();
        const thisWeekStart = new Date(todayStart);
        thisWeekStart.setDate(thisWeekStart.getDate() - dayOfWeek);
        const start = new Date(thisWeekStart);
        start.setDate(start.getDate() - 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return { start, end };
      }
      case 'last7Days': {
        const start = new Date(todayStart);
        start.setDate(start.getDate() - 6);
        return { start, end: new Date(todayStart) };
      }
      case 'last30Days': {
        const start = new Date(todayStart);
        start.setDate(start.getDate() - 29);
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
      default:
        return { start: todayStart, end: todayStart };
    }
  }

  // ============================================
  // Navigation Helpers
  // ============================================

  function getNavigationStepForPreset(key) {
    switch (key) {
      case 'today': case 'yesterday': return { type: 'days', count: 1 };
      case 'thisWeek': case 'lastWeek': case 'last7Days': return { type: 'days', count: 7 };
      case 'last30Days': return { type: 'days', count: 30 };
      case 'thisMonth': case 'lastMonth': return { type: 'month', count: 1 };
      default: return { type: 'days', count: 1 };
    }
  }

  function calculateNavigationStep(start, end) {
    const diffMs = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
      - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    return { type: 'days', count: Math.round(diffMs / 86400000) + 1 };
  }

  function shiftDateRange(start, end, step, dir) {
    if (step.type === 'month') {
      const shift = step.count * dir;
      const newStart = new Date(start.getFullYear(), start.getMonth() + shift, 1);
      const newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
      return { start: newStart, end: newEnd };
    }
    const shift = step.count * dir;
    const s = new Date(start); s.setDate(s.getDate() + shift);
    const e = new Date(end); e.setDate(e.getDate() + shift);
    return { start: s, end: e };
  }

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
    if (Array.isArray(enable) && enable.length > 0) {
      const isEnabled = enable.some((condition) => matchesCondition(date, condition));
      return !isEnabled;
    }

    // If disable is specified: disable if matching any condition
    if (Array.isArray(disable) && disable.length > 0) {
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
     * @param {Object} [options.yearRange] - Year range for year selector { min, max }
     * @param {boolean} [options.quickSelect=false] - Show quick select preset panel (period mode only)
     */
    constructor(container, options = {}) {
      this.container =
        typeof container === 'string' ? document.querySelector(container) : container;

      if (!this.container) {
        throw new Error('PodoDatePicker: Container element not found');
      }

      // Prevent duplicate initialization
      if (this.container._podoDatePicker) {
        return this.container._podoDatePicker;
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
      // Ensure disable and enable are always arrays
      this.disable = Array.isArray(options.disable) ? options.disable : [];
      this.enable = Array.isArray(options.enable) ? options.enable : [];
      this.minDate = options.minDate;
      this.maxDate = options.maxDate;
      this.minuteStep = options.minuteStep || 1;
      this.texts = { ...DEFAULT_TEXTS, ...options.texts };
      this.format = options.format;
      this.initialCalendar = options.initialCalendar || {};
      this.yearRange = options.yearRange;
      this.quickSelect = options.quickSelect || false;

      // Merge quickSelect texts
      if (options.texts?.quickSelect) {
        this.texts.quickSelect = { ...DEFAULT_TEXTS.quickSelect, ...options.texts.quickSelect };
      }

      // State
      this.isOpen = false;
      this.selectingPart = null;
      this.navigationStep = null;

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

      // 반응형: 화면 크기 변경 시 드롭다운 다시 렌더링 (Period 모드) + maxWidth 업데이트
      this._lastMobileState = this.isMobileView();
      this._resizeHandler = () => {
        const isMobile = this.isMobileView();
        if (this.isOpen) {
          // maxWidth 항상 업데이트
          this.updateDropdownMaxWidth();
          // Period 모드에서 모바일 상태 변경 시 드롭다운 다시 렌더링
          if (this.mode === 'period' && isMobile !== this._lastMobileState) {
            this._lastMobileState = isMobile;
            this.renderDropdown();
          }
        }
      };
      window.addEventListener('resize', this._resizeHandler);

      // Store instance on container for tracking
      this.container._podoDatePicker = this;
    }

    // ============================================
    // Rendering
    // ============================================

    render() {
      this.container.innerHTML = '';
      this.container.className = PREFIX;

      const showNavigation = this.quickSelect && this.mode === 'period';

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

      if (showNavigation) {
        this.inputEl.classList.add(`${PREFIX}__input--with-nav`);

        // Left arrow (prepend before inputContent)
        this._prevArrowBtn = createElement('button', `${PREFIX}__nav-arrow ${PREFIX}__nav-arrow--left`);
        this._prevArrowBtn.type = 'button';
        this._prevArrowBtn.innerHTML = '<i class="icon-expand-left"></i>';
        this._prevArrowBtn.disabled = this.disabled || this.isNavDisabled(-1);
        this._prevArrowBtn.addEventListener('click', (e) => { e.stopPropagation(); this.handleNavigate(-1); });
        this.inputEl.insertBefore(this._prevArrowBtn, this.inputContentEl);

        // Preset label
        this._presetLabelEl = createElement('span', `${PREFIX}__preset-label`);
        this.updatePresetLabel();
        this.inputEl.insertBefore(this._presetLabelEl, this.inputContentEl);

        // Remove calendar icon
        if (this.iconEl && this.iconEl.parentNode) {
          this.iconEl.parentNode.removeChild(this.iconEl);
        }

        // Right arrow (append after content)
        this._nextArrowBtn = createElement('button', `${PREFIX}__nav-arrow ${PREFIX}__nav-arrow--right`);
        this._nextArrowBtn.type = 'button';
        this._nextArrowBtn.innerHTML = '<i class="icon-expand-right"></i>';
        this._nextArrowBtn.disabled = this.disabled || this.isNavDisabled(1);
        this._nextArrowBtn.addEventListener('click', (e) => { e.stopPropagation(); this.handleNavigate(1); });
        this.inputEl.appendChild(this._nextArrowBtn);
      }

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
        const showQS = this.quickSelect && this.mode === 'period';

        if (showQS) {
          const body = createElement('div', `${PREFIX}__dropdown-body`);
          body.appendChild(this.renderQuickSelectPanel());
          const calWrapper = createElement('div', `${PREFIX}__period-calendars-wrapper`);
          this.renderPeriodCalendarsInto(calWrapper);
          body.appendChild(calWrapper);
          this.dropdownEl.appendChild(body);
        } else {
          this.renderPeriodCalendars();
        }
      } else {
        this.renderCalendar(this.viewDate, (date) => this.handleViewDateChange(date));
      }

      // Action buttons
      if (this.showActions) {
        this.renderActions();
      }
    }

    /**
     * Quick Select 패널 렌더링
     * @returns {HTMLElement}
     */
    renderQuickSelectPanel() {
      const panel = createElement('div', `${PREFIX}__quick-select-panel`);

      QUICK_SELECT_KEYS.forEach((key) => {
        const label = this.texts.quickSelect?.[key] || key;
        const disabled = this.isQSPresetDisabled(key);
        const active = this.isQSPresetActive(key);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.className = `${PREFIX}__quick-select-item`;
        if (active) btn.classList.add(`${PREFIX}__quick-select-item--active`);
        if (disabled) {
          btn.classList.add(`${PREFIX}__quick-select-item--disabled`);
          btn.disabled = true;
        }

        if (!disabled) {
          btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleQuickSelect(key);
          });
        }

        panel.appendChild(btn);
      });

      return panel;
    }

    isQSPresetDisabled(key) {
      const { start, end } = getPresetRange(key);

      if (this.minDate) {
        const min = this.minDate instanceof Date ? this.minDate : this.minDate.date;
        const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
        if (start < minDay) return true;
      }

      if (this.maxDate) {
        const max = this.maxDate instanceof Date ? this.maxDate : this.maxDate.date;
        const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
        if (end > maxDay) return true;
      }

      return false;
    }

    isQSPresetActive(key) {
      if (!this.tempValue.date || !this.tempValue.endDate) return false;
      const { start, end } = getPresetRange(key);
      return isSameDay(this.tempValue.date, start) && isSameDay(this.tempValue.endDate, end);
    }

    handleQuickSelect(key) {
      const { start, end } = getPresetRange(key);
      this.tempValue = { date: start, endDate: end, time: this.tempValue.time, endTime: this.tempValue.endTime };
      this.viewDate = new Date(start.getFullYear(), start.getMonth(), 1);
      this.endViewDate = new Date(end.getFullYear(), end.getMonth(), 1);
      this.navigationStep = getNavigationStepForPreset(key);

      if (!this.showActions) {
        this.value = { ...this.tempValue };
        this.onChange?.(this.value);
        this.close();
      }
      this.renderInputContent();
      this.updateNavArrows();
      this.renderDropdown();
    }

    /**
     * PeriodCalendars를 지정된 컨테이너에 렌더링
     * @param {HTMLElement} container
     */
    renderPeriodCalendarsInto(container) {
      const wrapper = createElement('div', `${PREFIX}__period-calendars`);
      const isMobile = this.isMobileView();

      const leftCal = createElement('div', `${PREFIX}__period-calendar-left`);
      const leftCalendar = this.createCalendarElement(
        this.viewDate,
        (date) => this.handleViewDateChange(date),
        { maxViewDate: isMobile ? undefined : this.endViewDate }
      );
      leftCal.appendChild(leftCalendar);
      wrapper.appendChild(leftCal);

      const rightCal = createElement('div', `${PREFIX}__period-calendar-right`);
      const rightCalendar = this.createCalendarElement(
        this.endViewDate,
        (date) => this.handleEndViewDateChange(date),
        { minViewDate: this.viewDate }
      );
      rightCal.appendChild(rightCalendar);
      wrapper.appendChild(rightCal);

      container.appendChild(wrapper);
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

    /**
     * 모바일 화면 여부 확인 (반응형 breakpoint: 600px)
     * @returns {boolean}
     */
    isMobileView() {
      return window.innerWidth <= 600;
    }

    renderPeriodCalendars() {
      const wrapper = createElement('div', `${PREFIX}__period-calendars`);
      const isMobile = this.isMobileView();

      // Left calendar
      // 모바일에서는 maxViewDate 제한 해제하여 자유롭게 이동 가능
      const leftCal = createElement('div', `${PREFIX}__period-calendar-left`);
      const leftCalendar = this.createCalendarElement(
        this.viewDate,
        (date) => this.handleViewDateChange(date),
        { maxViewDate: isMobile ? undefined : this.endViewDate }
      );
      leftCal.appendChild(leftCalendar);
      wrapper.appendChild(leftCal);

      // Right calendar (모바일에서는 CSS로 숨김)
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

    /**
     * Calculate year bounds for year selector
     * Priority: yearRange > minDate/maxDate > default (±100 years)
     */
    calculateYearBounds(minViewYear, maxViewYear) {
      const currentYear = new Date().getFullYear();
      let minYearBound = currentYear - 100;
      let maxYearBound = currentYear + 100;

      // Apply minDate/maxDate limits
      if (this.minDate) {
        const { date } = extractDateTimeLimit(this.minDate);
        minYearBound = Math.max(minYearBound, date.getFullYear());
      }
      if (this.maxDate) {
        const { date } = extractDateTimeLimit(this.maxDate);
        maxYearBound = Math.min(maxYearBound, date.getFullYear());
      }

      // yearRange takes priority
      if (this.yearRange?.min !== undefined) minYearBound = this.yearRange.min;
      if (this.yearRange?.max !== undefined) maxYearBound = this.yearRange.max;

      return { minYearBound, maxYearBound };
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
      const { minYearBound, maxYearBound } = this.calculateYearBounds(minYear, maxYear);
      for (let y = minYearBound; y <= maxYearBound; y++) {
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
      this.updateDropdownMaxWidth();
    }

    updateDropdownMaxWidth() {
      if (!this.dropdownEl) return;
      const rect = this.dropdownEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 8;
      const availableWidth = viewportWidth - rect.left - padding;
      if (availableWidth > 0) {
        this.dropdownEl.style.maxWidth = `${availableWidth}px`;
      } else {
        this.dropdownEl.style.maxWidth = '';
      }
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
          this.navigationStep = calculateNavigationStep(newDate, existingStartDate);
        } else {
          const adjustedEndTime = this.adjustTimeForDate(newDate, this.tempValue.endTime);
          this.tempValue = { ...this.tempValue, endDate: newDate, endTime: adjustedEndTime };
          this.navigationStep = calculateNavigationStep(existingStartDate, newDate);
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
        // Auto-set end date to today if not selected when changing end time
        if (!this.tempValue.endDate) {
          this.tempValue = { ...this.tempValue, endDate: new Date(), endTime: newTime };
        } else {
          this.tempValue = { ...this.tempValue, endTime: newTime };
        }
      } else {
        // Auto-set start date to today if not selected when changing start time
        if (!this.tempValue.date) {
          this.tempValue = { ...this.tempValue, date: new Date(), time: newTime };
        } else {
          this.tempValue = { ...this.tempValue, time: newTime };
        }
      }

      // Always apply time changes immediately
      this.value = { ...this.tempValue };
      this.emitChange();
      this.renderInputContent();
    }

    handleNavigate(direction) {
      const dv = this.showActions ? this.tempValue : this.value;
      if (!dv?.date || !dv?.endDate || !this.navigationStep) return;

      const { start, end } = shiftDateRange(dv.date, dv.endDate, this.navigationStep, direction);

      if (this.minDate) {
        const min = this.minDate instanceof Date ? this.minDate : this.minDate.date;
        if (start < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return;
      }
      if (this.maxDate) {
        const max = this.maxDate instanceof Date ? this.maxDate : this.maxDate.date;
        if (end > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return;
      }

      const newValue = { date: start, endDate: end, time: dv.time, endTime: dv.endTime };
      this.tempValue = newValue;
      this.value = { ...newValue };
      this.viewDate = new Date(start.getFullYear(), start.getMonth(), 1);
      this.endViewDate = new Date(end.getFullYear(), end.getMonth(), 1);
      this.emitChange();
      this.renderInputContent();
      this.updateNavArrows();
      if (this.isOpen) this.renderDropdown();
    }

    isNavDisabled(direction) {
      const dv = this.showActions ? this.tempValue : this.value;
      if (!dv?.date || !dv?.endDate || !this.navigationStep) return true;
      const { start, end } = shiftDateRange(dv.date, dv.endDate, this.navigationStep, direction);
      if (direction === -1 && this.minDate) {
        const min = this.minDate instanceof Date ? this.minDate : this.minDate.date;
        return start < new Date(min.getFullYear(), min.getMonth(), min.getDate());
      }
      if (direction === 1 && this.maxDate) {
        const max = this.maxDate instanceof Date ? this.maxDate : this.maxDate.date;
        return end > new Date(max.getFullYear(), max.getMonth(), max.getDate());
      }
      return false;
    }

    updateNavArrows() {
      if (this._prevArrowBtn) {
        this._prevArrowBtn.disabled = this.disabled || this.isNavDisabled(-1);
      }
      if (this._nextArrowBtn) {
        this._nextArrowBtn.disabled = this.disabled || this.isNavDisabled(1);
      }
      this.updatePresetLabel();
    }

    getActivePresetLabel() {
      const dv = this.showActions ? this.tempValue : this.value;
      if (!dv?.date || !dv?.endDate) return null;
      for (const key of QUICK_SELECT_KEYS) {
        const { start, end } = getPresetRange(key);
        if (isSameDay(dv.date, start) && isSameDay(dv.endDate, end)) {
          return this.texts.quickSelect?.[key] || key;
        }
      }
      return null;
    }

    updatePresetLabel() {
      if (!this._presetLabelEl) return;
      const label = this.getActivePresetLabel();
      if (label) {
        this._presetLabelEl.textContent = `${label} :`;
        this._presetLabelEl.style.display = '';
      } else {
        this._presetLabelEl.textContent = '';
        this._presetLabelEl.style.display = 'none';
      }
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
      // Remove resize event listener
      if (this._resizeHandler) {
        window.removeEventListener('resize', this._resizeHandler);
      }
      // Remove instance tracking
      if (this.container._podoDatePicker) {
        delete this.container._podoDatePicker;
      }
      this.container.innerHTML = '';
    }
  }

  return PodoDatePicker;
});
