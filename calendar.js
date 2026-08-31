/**
 * calendar.js - Interactive Academic Calendar for KTU Deadlines
 */

class CalendarManager {
  static currentDate = new Date();
  static selectedDate = new Date();

  static init() {
    this.bindEvents();
    this.render();
  }

  static bindEvents() {
    const prevBtn = document.getElementById('cal-prev-month');
    const nextBtn = document.getElementById('cal-next-month');
    const todayBtn = document.getElementById('cal-today-btn');
    const addDateBtn = document.getElementById('btn-cal-add-date');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.render();
      });
    }

    if (addDateBtn) {
      addDateBtn.addEventListener('click', () => {
        if (window.App) {
          // Format selectedDate for datetime-local input (YYYY-MM-DDTHH:MM)
          const d = this.selectedDate;
          const pad = (n) => (n < 10 ? '0' + n : n);
          const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T17:00`;
          window.App.openDeadlineModal(null, formatted);
        }
      });
    }
  }

  static render() {
    const monthYearLabel = document.getElementById('calendar-month-year-label');
    const daysGrid = document.getElementById('calendar-days-grid');
    if (!monthYearLabel || !daysGrid) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    monthYearLabel.textContent = `${monthNames[month]} ${year}`;

    // Get all deadlines
    const deadlines = StorageManager.getDeadlines();

    // First day of month & total days
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    daysGrid.innerHTML = '';

    const today = new Date();

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const cellDate = new Date(year, month - 1, dayNum);
      const cell = this.createDayCell(dayNum, cellDate, true, deadlines, today);
      daysGrid.appendChild(cell);
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const cell = this.createDayCell(day, cellDate, false, deadlines, today);
      daysGrid.appendChild(cell);
    }

    // Trailing next month days to complete 35 or 42 grid cells
    const totalCells = daysGrid.children.length;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const cellDate = new Date(year, month + 1, i);
      const cell = this.createDayCell(i, cellDate, true, deadlines, today);
      daysGrid.appendChild(cell);
    }

    this.renderSidebarEvents();
  }

  static createDayCell(dayNum, cellDate, isOtherMonth, deadlines, today) {
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    if (isOtherMonth) cell.classList.add('other-month');

    // Today highlight
    if (
      cellDate.getDate() === today.getDate() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getFullYear() === today.getFullYear()
    ) {
      cell.classList.add('today');
    }

    // Selected highlight
    if (
      cellDate.getDate() === this.selectedDate.getDate() &&
      cellDate.getMonth() === this.selectedDate.getMonth() &&
      cellDate.getFullYear() === this.selectedDate.getFullYear()
    ) {
      cell.classList.add('selected');
    }

    // Day number
    const numSpan = document.createElement('span');
    numSpan.className = 'cal-day-number';
    numSpan.textContent = dayNum;
    cell.appendChild(numSpan);

    // Matching events for this date
    const dateStr = cellDate.toISOString().slice(0, 10);
    const dayEvents = deadlines.filter(dl => {
      if (!dl.deadline) return false;
      const dlDateStr = new Date(dl.deadline).toISOString().slice(0, 10);
      return dlDateStr === dateStr;
    });

    if (dayEvents.length > 0) {
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'cal-event-dots';

      dayEvents.slice(0, 4).forEach(ev => {
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        if (ev.type === 'exam') dot.classList.add('dot-exam');
        else if (ev.type === 'lab') dot.classList.add('dot-lab');
        else if (ev.type === 'project') dot.classList.add('dot-project');
        else if (ev.priority === 'high') dot.classList.add('dot-urgent');
        dotsWrap.appendChild(dot);
      });

      cell.appendChild(dotsWrap);
    }

    // On Click: Select Date and render sidebar
    cell.addEventListener('click', () => {
      this.selectedDate = new Date(cellDate);
      this.render();
    });

    return cell;
  }

  static renderSidebarEvents() {
    const list = document.getElementById('sidebar-events-list');
    const title = document.getElementById('sidebar-selected-date-title');
    const badge = document.getElementById('sidebar-day-badge');
    if (!list || !title) return;

    const d = this.selectedDate;
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    title.textContent = d.toLocaleDateString(undefined, options);

    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    if (badge) {
      badge.textContent = isToday ? '⭐ Today' : 'Selected Date';
    }

    const dateStr = d.toISOString().slice(0, 10);
    const deadlines = StorageManager.getDeadlines();
    const matching = deadlines.filter(dl => {
      if (!dl.deadline) return false;
      return new Date(dl.deadline).toISOString().slice(0, 10) === dateStr;
    });

    list.innerHTML = '';

    if (matching.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.8125rem;">
          <p>No deadlines scheduled for this date.</p>
        </div>
      `;
      return;
    }

    matching.forEach(dl => {
      const timeRemaining = NotificationManager.getRemainingTime(dl.deadline, dl.status);
      const item = document.createElement('div');
      item.className = 'kanban-card';
      item.style.cursor = 'default';

      const typeLabels = {
        assignment: '📝 Assignment',
        exam: '🎯 Exam',
        lab: '🧪 Lab Record',
        project: '💻 Project',
        registration: '📋 Registration',
        activity: '🏆 Activity Points',
        other: '📌 Other'
      };

      const dueTime = new Date(dl.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      item.innerHTML = `
        <div class="card-top-row">
          <span class="card-subject-name">${dl.courseCode || dl.subject}</span>
          <span class="card-type-badge">${typeLabels[dl.type] || dl.type}</span>
        </div>
        <h4 style="font-size: 0.9375rem; color: var(--text-primary); font-weight: 600;">${dl.title}</h4>
        <div class="card-meta-row">
          <span class="meta-item"><i data-lucide="clock"></i> Due: ${dueTime}</span>
          <span class="countdown-badge countdown-${timeRemaining.category}">${timeRemaining.formatted}</span>
        </div>
      `;

      list.appendChild(item);
    });

    if (window.lucide) {
      lucide.createIcons({ root: list });
    }
  }
}
