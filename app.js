/**
 * app.js - Main Application Controller for KTU Student Academic Assistant
 */

class App {
  static currentView = 'list';
  static cardViewMode = 'cards'; // 'cards' or 'table'
  static activeFilters = {
    search: '',
    subject: 'all',
    category: 'all',
    status: 'all',
    urgency: 'all'
  };
  static activeNoticeFilter = 'all';

  static init() {
    this.initTheme();
    this.bindNavigation();
    this.bindModals();
    this.bindFilters();
    this.bindSettingsAndPresets();
    this.bindKanbanDropZones();
    this.renderAll();

    // Attach global reference for cross-module calls
    window.App = this;
  }

  // ==================== THEME MANAGEMENT ====================

  static initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(STORAGE_KEYS.THEME, next);
        this.updateThemeIcon(next);
        NotificationManager.showToast(`Switched to ${next} theme`, 'info', 2000);
      });
    }
  }

  static updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    if (theme === 'dark') {
      icon.setAttribute('data-lucide', 'sun');
    } else {
      icon.setAttribute('data-lucide', 'moon');
    }
    if (window.lucide) {
      lucide.createIcons({ root: document.querySelector('.header-actions') });
    }
  }

  // ==================== NAVIGATION & VIEW TOGGLING ====================

  static bindNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });

    // Cards vs Table view toggle
    const btnViewCards = document.getElementById('btn-view-cards');
    const btnViewTable = document.getElementById('btn-view-table');

    if (btnViewCards && btnViewTable) {
      btnViewCards.addEventListener('click', () => {
        this.cardViewMode = 'cards';
        btnViewCards.classList.add('active');
        btnViewTable.classList.remove('active');
        this.renderDeadlinesList();
      });

      btnViewTable.addEventListener('click', () => {
        this.cardViewMode = 'table';
        btnViewTable.classList.add('active');
        btnViewCards.classList.remove('active');
        this.renderDeadlinesList();
      });
    }

    // Notification Permission Button
    const notifBtn = document.getElementById('btn-notification-toggle');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        NotificationManager.requestPermission();
      });
    }

    // Urgent banner filter action
    const btnFilterUrgent = document.getElementById('btn-filter-urgent');
    if (btnFilterUrgent) {
      btnFilterUrgent.addEventListener('click', () => {
        this.switchView('list');
        this.activeFilters.urgency = 'urgent';
        document.querySelectorAll('.chip-btn[data-urgency]').forEach(b => {
          b.classList.toggle('active', b.dataset.urgency === 'urgent');
        });
        this.renderDeadlinesList();
      });
    }

    const btnDismissBanner = document.getElementById('btn-dismiss-urgent-banner');
    if (btnDismissBanner) {
      btnDismissBanner.addEventListener('click', () => {
        const banner = document.getElementById('urgent-alert-banner');
        if (banner) banner.classList.add('hidden');
      });
    }
  }

  static switchView(viewName) {
    this.currentView = viewName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update panel visibility
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Show/hide deadlines toolbar
    const toolbar = document.getElementById('deadlines-toolbar');
    const toggleGroup = document.getElementById('list-card-toggle-group');

    if (toolbar) {
      toolbar.style.display = (viewName === 'list') ? 'flex' : 'none';
    }
    if (toggleGroup) {
      toggleGroup.style.display = (viewName === 'list') ? 'flex' : 'none';
    }

    // Trigger sub-view updates
    if (viewName === 'calendar') {
      CalendarManager.init();
    } else if (viewName === 'kanban') {
      this.renderKanban();
    } else if (viewName === 'notices') {
      this.renderNotices();
    } else if (viewName === 'analytics') {
      this.renderAnalytics();
    } else {
      this.renderDeadlinesList();
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // ==================== FILTERS & SEARCH ====================

  static bindFilters() {
    const searchInput = document.getElementById('filter-search');
    const clearSearchBtn = document.getElementById('btn-clear-search');
    const subjectSelect = document.getElementById('filter-subject');
    const categorySelect = document.getElementById('filter-category');
    const statusSelect = document.getElementById('filter-status');
    const urgencyChips = document.querySelectorAll('.chip-btn[data-urgency]');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.activeFilters.search = e.target.value.toLowerCase().trim();
        if (clearSearchBtn) {
          clearSearchBtn.classList.toggle('hidden', this.activeFilters.search === '');
        }
        this.renderDeadlinesList();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.activeFilters.search = '';
        clearSearchBtn.classList.add('hidden');
        this.renderDeadlinesList();
      });
    }

    if (subjectSelect) {
      subjectSelect.addEventListener('change', (e) => {
        this.activeFilters.subject = e.target.value;
        this.renderDeadlinesList();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.activeFilters.category = e.target.value;
        this.renderDeadlinesList();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.activeFilters.status = e.target.value;
        this.renderDeadlinesList();
      });
    }

    urgencyChips.forEach(chip => {
      chip.addEventListener('click', () => {
        urgencyChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilters.urgency = chip.dataset.urgency;
        this.renderDeadlinesList();
      });
    });

    // Notices filters
    const noticeChips = document.querySelectorAll('.chip-btn[data-notice-filter]');
    noticeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        noticeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeNoticeFilter = chip.dataset.noticeFilter;
        this.renderNotices();
      });
    });
  }

  // ==================== MODALS & FORMS ====================

  static bindModals() {
    // Open Add Deadline Modal
    const btnOpenAdd = document.getElementById('btn-open-add-modal');
    const btnEmptyAdd = document.getElementById('btn-empty-add');
    const btnKanbanAdd = document.getElementById('btn-kanban-add');

    const openAddHandler = () => this.openDeadlineModal();
    if (btnOpenAdd) btnOpenAdd.addEventListener('click', openAddHandler);
    if (btnEmptyAdd) btnEmptyAdd.addEventListener('click', openAddHandler);
    if (btnKanbanAdd) btnKanbanAdd.addEventListener('click', openAddHandler);

    // Close Modal buttons
    const btnCloseDeadlineModal = document.getElementById('btn-close-deadline-modal');
    const btnCancelDeadline = document.getElementById('btn-cancel-deadline');
    const deadlineModal = document.getElementById('modal-deadline');

    const closeDeadlineHandler = () => {
      deadlineModal.classList.add('hidden');
    };
    if (btnCloseDeadlineModal) btnCloseDeadlineModal.addEventListener('click', closeDeadlineHandler);
    if (btnCancelDeadline) btnCancelDeadline.addEventListener('click', closeDeadlineHandler);

    // Save Deadline Form
    const formDeadline = document.getElementById('form-deadline');
    if (formDeadline) {
      formDeadline.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveDeadline();
      });
    }

    // Notice Modal
    const btnAddNotice = document.getElementById('btn-add-notice');
    const btnCloseNoticeModal = document.getElementById('btn-close-notice-modal');
    const btnCancelNotice = document.getElementById('btn-cancel-notice');
    const noticeModal = document.getElementById('modal-notice');
    const formNotice = document.getElementById('form-notice');

    if (btnAddNotice) {
      btnAddNotice.addEventListener('click', () => {
        formNotice.reset();
        noticeModal.classList.remove('hidden');
      });
    }

    const closeNoticeHandler = () => noticeModal.classList.add('hidden');
    if (btnCloseNoticeModal) btnCloseNoticeModal.addEventListener('click', closeNoticeHandler);
    if (btnCancelNotice) btnCancelNotice.addEventListener('click', closeNoticeHandler);

    if (formNotice) {
      formNotice.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveNotice();
      });
    }

    // Settings Modal
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings-modal');
    const settingsModal = document.getElementById('modal-settings');

    if (btnOpenSettings) {
      btnOpenSettings.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
      });
    }
    if (btnCloseSettings) {
      btnCloseSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
      });
    }

    // Close modals on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });
  }

  static openDeadlineModal(deadlineItem = null, prefilledDate = null) {
    const modal = document.getElementById('modal-deadline');
    const title = document.getElementById('modal-deadline-title');
    const saveLabel = document.getElementById('btn-save-label');
    const form = document.getElementById('form-deadline');
    form.reset();

    if (deadlineItem) {
      title.textContent = 'Edit Academic Deadline';
      saveLabel.textContent = 'Update Deadline';
      document.getElementById('deadline-id').value = deadlineItem.id;
      document.getElementById('deadline-subject').value = deadlineItem.subject;
      document.getElementById('deadline-course-code').value = deadlineItem.courseCode || '';
      document.getElementById('deadline-title').value = deadlineItem.title;
      document.getElementById('deadline-type').value = deadlineItem.type;
      document.getElementById('deadline-priority').value = deadlineItem.priority;
      document.getElementById('deadline-status').value = deadlineItem.status;
      document.getElementById('deadline-marks').value = deadlineItem.marks || '';
      document.getElementById('deadline-link').value = deadlineItem.link || '';
      document.getElementById('deadline-notes').value = deadlineItem.notes || '';

      if (deadlineItem.deadline) {
        const d = new Date(deadlineItem.deadline);
        const pad = (n) => (n < 10 ? '0' + n : n);
        document.getElementById('deadline-datetime').value =
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    } else {
      title.textContent = 'Add Academic Deadline';
      saveLabel.textContent = 'Save Deadline';
      document.getElementById('deadline-id').value = '';

      if (prefilledDate) {
        document.getElementById('deadline-datetime').value = prefilledDate;
      } else {
        // Default to tomorrow 17:00
        const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
        const pad = (n) => (n < 10 ? '0' + n : n);
        document.getElementById('deadline-datetime').value =
          `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T17:00`;
      }
    }

    modal.classList.remove('hidden');
  }

  static handleSaveDeadline() {
    const id = document.getElementById('deadline-id').value;
    const subject = document.getElementById('deadline-subject').value.trim();
    const courseCode = document.getElementById('deadline-course-code').value.trim().toUpperCase();
    const title = document.getElementById('deadline-title').value.trim();
    const type = document.getElementById('deadline-type').value;
    const priority = document.getElementById('deadline-priority').value;
    const deadlineVal = document.getElementById('deadline-datetime').value;
    const status = document.getElementById('deadline-status').value;
    const marks = document.getElementById('deadline-marks').value ? Number(document.getElementById('deadline-marks').value) : null;
    const link = document.getElementById('deadline-link').value.trim();
    const notes = document.getElementById('deadline-notes').value.trim();

    if (!subject || !title || !deadlineVal) {
      NotificationManager.showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const payload = {
      subject,
      courseCode,
      title,
      type,
      priority,
      deadline: new Date(deadlineVal).toISOString(),
      status,
      marks,
      link,
      notes
    };

    if (id) {
      StorageManager.updateDeadline(id, payload);
      NotificationManager.showToast('Deadline updated successfully!', 'success');
    } else {
      StorageManager.addDeadline(payload);
      NotificationManager.showToast('New deadline added to your tracker!', 'success');
    }

    document.getElementById('modal-deadline').classList.add('hidden');
    this.renderAll();
  }

  static handleSaveNotice() {
    const title = document.getElementById('notice-title').value.trim();
    const category = document.getElementById('notice-category').value;
    const isPinned = document.getElementById('notice-urgent-check').checked;
    const content = document.getElementById('notice-content').value.trim();
    const link = document.getElementById('notice-link').value.trim();

    if (!title || !content) {
      NotificationManager.showToast('Please enter both title and notice details.', 'warning');
      return;
    }

    StorageManager.addNotice({
      title,
      category,
      isPinned,
      content,
      link
    });

    document.getElementById('modal-notice').classList.add('hidden');
    NotificationManager.showToast('Notice posted to board!', 'success');
    this.renderNotices();
    this.updateStats();
  }

  // ==================== SETTINGS & PRESETS ====================

  static bindSettingsAndPresets() {
    // Quick Demo buttons
    const btnLoadDemo = document.getElementById('btn-load-demo');
    const btnEmptyDemo = document.getElementById('btn-empty-demo');
    const btnPresetS5 = document.getElementById('btn-load-preset-s5-cse');
    const btnPresetGeneric = document.getElementById('btn-load-preset-generic');

    const loadDemoHandler = () => {
      StorageManager.loadSampleData();
      NotificationManager.showToast('Loaded sample KTU curriculum deadlines & notices!', 'success');
      document.getElementById('modal-settings').classList.add('hidden');
      this.renderAll();
    };

    if (btnLoadDemo) btnLoadDemo.addEventListener('click', loadDemoHandler);
    if (btnEmptyDemo) btnEmptyDemo.addEventListener('click', loadDemoHandler);
    if (btnPresetS5) btnPresetS5.addEventListener('click', loadDemoHandler);

    if (btnPresetGeneric) {
      btnPresetGeneric.addEventListener('click', () => {
        StorageManager.loadSampleData();
        NotificationManager.showToast('General B.Tech presets loaded!', 'success');
        document.getElementById('modal-settings').classList.add('hidden');
        this.renderAll();
      });
    }

    // Export .ICS
    const btnExportICS = document.getElementById('btn-export-ics');
    const btnExportICSSettings = document.getElementById('btn-export-ics-settings');
    const icsHandler = () => {
      const ok = StorageManager.exportToICS();
      if (ok) {
        NotificationManager.showToast('Downloaded .ICS file! Open it to import into Google/Apple Calendar.', 'success');
      } else {
        NotificationManager.showToast('No deadlines to export.', 'warning');
      }
    };
    if (btnExportICS) btnExportICS.addEventListener('click', icsHandler);
    if (btnExportICSSettings) btnExportICSSettings.addEventListener('click', icsHandler);

    // Export JSON Backup
    const btnExportJSON = document.getElementById('btn-export-json');
    const btnFooterBackup = document.getElementById('btn-footer-backup');
    const jsonBackupHandler = () => {
      StorageManager.exportBackupJSON();
      NotificationManager.showToast('Academic data backup exported (.json)!', 'success');
    };
    if (btnExportJSON) btnExportJSON.addEventListener('click', jsonBackupHandler);
    if (btnFooterBackup) btnFooterBackup.addEventListener('click', jsonBackupHandler);

    // Import JSON Backup
    const inputImportJSON = document.getElementById('input-import-json');
    if (inputImportJSON) {
      inputImportJSON.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = StorageManager.importBackupJSON(event.target.result);
          if (res.success) {
            NotificationManager.showToast(`Successfully restored ${res.count} deadlines!`, 'success');
            document.getElementById('modal-settings').classList.add('hidden');
            this.renderAll();
          } else {
            NotificationManager.showToast('Failed to import JSON: ' + res.error, 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    // Wipe All Data
    const btnWipe = document.getElementById('btn-wipe-all-data');
    if (btnWipe) {
      btnWipe.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL deadlines and notices? This cannot be undone.')) {
          StorageManager.clearAll();
          NotificationManager.showToast('All stored data cleared.', 'info');
          document.getElementById('modal-settings').classList.add('hidden');
          this.renderAll();
        }
      });
    }
  }

  // ==================== RENDERING ENGINE ====================

  static renderAll() {
    this.updateStats();
    this.populateSubjectFilter();
    this.renderDeadlinesList();
    if (this.currentView === 'kanban') this.renderKanban();
    if (this.currentView === 'calendar') CalendarManager.render();
    if (this.currentView === 'notices') this.renderNotices();
    if (this.currentView === 'analytics') this.renderAnalytics();
  }

  /**
   * Updates Top Metric Summary Cards & Banner
   */
  static updateStats() {
    const deadlines = StorageManager.getDeadlines();
    const notices = StorageManager.getNotices();

    const pending = deadlines.filter(d => d.status !== 'completed');
    const completed = deadlines.filter(d => d.status === 'completed');

    // Count urgent (due in <= 48 hours and not completed)
    let urgentItems = [];
    const now = Date.now();

    deadlines.forEach(item => {
      if (item.status === 'completed') return;
      const due = new Date(item.deadline).getTime();
      const diffHours = (due - now) / (1000 * 60 * 60);
      if (diffHours <= 48) {
        urgentItems.push(item);
      }
    });

    // Unique active subjects
    const uniqueSubjects = new Set(deadlines.map(d => d.subject.trim()));
    const exams = deadlines.filter(d => d.type === 'exam' && d.status !== 'completed');

    // Update DOM numbers
    document.getElementById('stat-pending-count').textContent = pending.length;
    document.getElementById('stat-urgent-count').textContent = urgentItems.length;
    document.getElementById('stat-completed-count').textContent = completed.length;
    document.getElementById('stat-subjects-count').textContent = uniqueSubjects.size;
    document.getElementById('stat-exam-count').textContent = `${exams.length} upcoming exam${exams.length === 1 ? '' : 's'}`;

    // Completion percentage
    const total = deadlines.length;
    const rate = total === 0 ? 0 : Math.round((completed.length / total) * 100);
    document.getElementById('stat-completion-rate').textContent = `${rate}% completion rate`;

    // Workload level
    const workloadEl = document.getElementById('stat-workload-level');
    const workloadBar = document.getElementById('stat-workload-bar');
    let workloadText = 'Light';
    let workloadWidth = 20;

    if (pending.length >= 7 || urgentItems.length >= 3) {
      workloadText = 'High / Critical';
      workloadWidth = 90;
      workloadEl.style.color = 'var(--rose-400)';
    } else if (pending.length >= 4 || urgentItems.length >= 1) {
      workloadText = 'Moderate';
      workloadWidth = 55;
      workloadEl.style.color = 'var(--amber-400)';
    } else {
      workloadText = 'Light';
      workloadWidth = 25;
      workloadEl.style.color = 'var(--emerald-400)';
    }
    workloadEl.textContent = workloadText;
    workloadBar.style.width = `${workloadWidth}%`;

    // Badges in tabs
    document.getElementById('badge-all-deadlines').textContent = pending.length;
    document.getElementById('badge-notices').textContent = notices.length;

    // Urgent Alert Banner
    const banner = document.getElementById('urgent-alert-banner');
    const bannerCount = document.getElementById('urgent-count-text');
    const bannerPreview = document.getElementById('urgent-preview-text');

    if (urgentItems.length > 0) {
      banner.classList.remove('hidden');
      bannerCount.textContent = `${urgentItems.length} Deadline${urgentItems.length === 1 ? '' : 's'} Due in &le; 48 Hours!`;
      const previewTitles = urgentItems.slice(0, 2).map(u => u.title).join(' and ');
      bannerPreview.textContent = `Focus on: ${previewTitles} to avoid loss of internal marks.`;
    } else {
      banner.classList.add('hidden');
    }
  }

  /**
   * Populates Subject Filter dropdown dynamically
   */
  static populateSubjectFilter() {
    const select = document.getElementById('filter-subject');
    if (!select) return;

    const deadlines = StorageManager.getDeadlines();
    const currentVal = this.activeFilters.subject;

    const subjects = [...new Set(deadlines.map(d => d.subject))].sort();

    select.innerHTML = '<option value="all">All Subjects</option>';
    subjects.forEach(subj => {
      const opt = document.createElement('option');
      opt.value = subj;
      opt.textContent = subj;
      if (subj === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }

  /**
   * Filter Deadlines Array
   */
  static getFilteredDeadlines() {
    let list = StorageManager.getDeadlines();
    const { search, subject, category, status, urgency } = this.activeFilters;

    // Text search
    if (search) {
      list = list.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.subject.toLowerCase().includes(search) ||
        (item.courseCode && item.courseCode.toLowerCase().includes(search)) ||
        (item.notes && item.notes.toLowerCase().includes(search))
      );
    }

    // Subject
    if (subject !== 'all') {
      list = list.filter(item => item.subject === subject);
    }

    // Category
    if (category !== 'all') {
      list = list.filter(item => item.type === category);
    }

    // Status
    if (status !== 'all') {
      if (status === 'overdue') {
        list = list.filter(item => {
          if (item.status === 'completed') return false;
          return new Date(item.deadline).getTime() < Date.now();
        });
      } else {
        list = list.filter(item => item.status === status);
      }
    }

    // Urgency chips
    const now = Date.now();
    if (urgency === 'urgent') {
      list = list.filter(item => {
        if (item.status === 'completed') return false;
        const diffHours = (new Date(item.deadline).getTime() - now) / (1000 * 60 * 60);
        return diffHours <= 48;
      });
    } else if (urgency === 'week') {
      list = list.filter(item => {
        if (item.status === 'completed') return false;
        const diffDays = (new Date(item.deadline).getTime() - now) / (1000 * 60 * 60 * 24);
        return diffDays >= -1 && diffDays <= 7;
      });
    } else if (urgency === 'high-priority') {
      list = list.filter(item => item.priority === 'high');
    }

    // Sort by: Upcoming earliest deadline first (completed at end)
    list.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    return list;
  }

  /**
   * Render Deadlines Tab (Cards or Table)
   */
  static renderDeadlinesList() {
    const list = this.getFilteredDeadlines();
    const emptyState = document.getElementById('deadlines-empty-state');
    const cardsContainer = document.getElementById('deadlines-cards-container');
    const tableContainer = document.getElementById('deadlines-table-container');
    const tableBody = document.getElementById('deadlines-table-body');

    if (list.length === 0) {
      emptyState.classList.remove('hidden');
      cardsContainer.classList.add('hidden');
      tableContainer.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    const typeIcons = {
      assignment: '📝 Assignment',
      exam: '🎯 Exam',
      lab: '🧪 Lab Record',
      project: '💻 Project',
      registration: '📋 Registration',
      activity: '🏆 Activity Points',
      other: '📌 Notice'
    };

    if (this.cardViewMode === 'cards') {
      cardsContainer.classList.remove('hidden');
      tableContainer.classList.add('hidden');
      cardsContainer.innerHTML = '';

      list.forEach(item => {
        const timeRemaining = NotificationManager.getRemainingTime(item.deadline, item.status);
        const card = document.createElement('div');
        card.className = `deadline-card ${item.status === 'completed' ? 'card-completed' : (timeRemaining.isUrgent ? 'card-urgent' : '')}`;

        const priorityEmoji = item.priority === 'high' ? '🔴 Urgent' : (item.priority === 'medium' ? '🟡 Medium' : '🟢 Low');
        const dueDate = new Date(item.deadline).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        card.innerHTML = `
          <div>
            <div class="card-top-row">
              <div class="card-subject-wrap">
                <span class="card-subject-name">${item.subject}</span>
                ${item.courseCode ? `<span class="card-course-code">${item.courseCode}</span>` : ''}
              </div>
              <span class="card-type-badge">${typeIcons[item.type] || item.type}</span>
            </div>

            <h3 class="card-task-title">${item.title}</h3>
            ${item.notes ? `<p class="card-notes">${item.notes}</p>` : ''}
          </div>

          <div>
            <div class="card-meta-row">
              <div class="meta-item" title="Due Date">
                <i data-lucide="calendar"></i>
                <span>${dueDate}</span>
              </div>
              <span class="countdown-badge countdown-${timeRemaining.category}">
                ${timeRemaining.category === 'urgent' ? '⚡ ' : ''}${timeRemaining.formatted}
              </span>
              ${item.marks ? `<div class="meta-item"><i data-lucide="award"></i> <span>${item.marks} M</span></div>` : ''}
              <div class="meta-item" style="margin-left: auto;">
                <span>${priorityEmoji}</span>
              </div>
            </div>

            <div class="card-actions-row">
              <select class="status-select-btn" data-deadline-id="${item.id}" aria-label="Change status">
                <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>🔴 Pending</option>
                <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>🟡 In Progress</option>
                <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>🟢 Submitted / Done</option>
              </select>

              <div class="card-action-icons">
                ${item.link ? `<a href="${item.link}" target="_blank" class="btn-card-action" title="Open Submission Link"><i data-lucide="external-link"></i></a>` : ''}
                <button class="btn-card-action btn-edit" data-edit-id="${item.id}" title="Edit Task"><i data-lucide="pencil"></i></button>
                <button class="btn-card-action btn-delete" data-delete-id="${item.id}" title="Delete Task"><i data-lucide="trash-2"></i></button>
              </div>
            </div>
          </div>
        `;

        cardsContainer.appendChild(card);
      });
    } else {
      // Table Mode
      cardsContainer.classList.add('hidden');
      tableContainer.classList.remove('hidden');
      tableBody.innerHTML = '';

      list.forEach(item => {
        const timeRemaining = NotificationManager.getRemainingTime(item.deadline, item.status);
        const row = document.createElement('tr');

        const dueDate = new Date(item.deadline).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        row.innerHTML = `
          <td>
            <select class="status-select-btn" data-deadline-id="${item.id}">
              <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>🔴 Pending</option>
              <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>🟡 In Progress</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>🟢 Done</option>
            </select>
          </td>
          <td>
            <div class="table-subject-tag">${item.subject}</div>
            <small style="font-family: var(--font-mono); color: var(--text-muted);">${item.courseCode || ''}</small>
          </td>
          <td>
            <div class="table-task-name">${item.title}</div>
            ${item.notes ? `<small style="color: var(--text-muted);">${item.notes.slice(0, 50)}...</small>` : ''}
          </td>
          <td><span class="card-type-badge">${typeIcons[item.type] || item.type}</span></td>
          <td>
            <div>${dueDate}</div>
            <span class="countdown-badge countdown-${timeRemaining.category}" style="font-size: 0.7rem;">
              ${timeRemaining.formatted}
            </span>
          </td>
          <td>
            <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
              ${item.priority === 'high' ? '🔴 High' : (item.priority === 'medium' ? '🟡 Med' : '🟢 Low')}
            </span>
          </td>
          <td>
            <div class="card-action-icons">
              ${item.link ? `<a href="${item.link}" target="_blank" class="btn-card-action" title="Open Link"><i data-lucide="external-link"></i></a>` : ''}
              <button class="btn-card-action btn-edit" data-edit-id="${item.id}"><i data-lucide="pencil"></i></button>
              <button class="btn-card-action btn-delete" data-delete-id="${item.id}"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        `;

        tableBody.appendChild(row);
      });
    }

    this.bindDeadlineCardActions();
    if (window.lucide) {
      lucide.createIcons({ root: document.getElementById('view-list') });
    }
  }

  static bindDeadlineCardActions() {
    // Status Select Changes
    document.querySelectorAll('.status-select-btn').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.dataset.deadlineId;
        const newStatus = e.target.value;
        StorageManager.updateStatus(id, newStatus);

        if (newStatus === 'completed') {
          NotificationManager.playChime('success');
          NotificationManager.triggerConfetti();
          NotificationManager.showToast('Task marked as completed! Great progress 🎉', 'success');
        }

        this.renderAll();
      });
    });

    // Edit Buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.editId;
        const item = StorageManager.getDeadlines().find(d => d.id === id);
        if (item) {
          this.openDeadlineModal(item);
        }
      });
    });

    // Delete Buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.deleteId;
        if (confirm('Delete this deadline?')) {
          StorageManager.deleteDeadline(id);
          NotificationManager.showToast('Deadline deleted.', 'info');
          this.renderAll();
        }
      });
    });
  }

  // ==================== KANBAN BOARD ====================

  static renderKanban() {
    const deadlines = StorageManager.getDeadlines();

    const pendingList = document.getElementById('kanban-list-pending');
    const inProgressList = document.getElementById('kanban-list-in-progress');
    const completedList = document.getElementById('kanban-list-completed');

    if (!pendingList || !inProgressList || !completedList) return;

    pendingList.innerHTML = '';
    inProgressList.innerHTML = '';
    completedList.innerHTML = '';

    let counts = { pending: 0, 'in-progress': 0, completed: 0 };

    deadlines.forEach(item => {
      const status = item.status || 'pending';
      counts[status] = (counts[status] || 0) + 1;

      const timeRemaining = NotificationManager.getRemainingTime(item.deadline, item.status);
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.draggable = true;
      card.dataset.id = item.id;

      card.innerHTML = `
        <div class="card-top-row">
          <span class="card-subject-name">${item.courseCode || item.subject}</span>
          <span class="countdown-badge countdown-${timeRemaining.category}" style="font-size: 0.7rem;">
            ${timeRemaining.formatted}
          </span>
        </div>
        <h4 style="font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); line-height: 1.3;">${item.title}</h4>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">${item.type.toUpperCase()}</span>
          <div class="card-action-icons">
            <button class="btn-card-action btn-edit" data-edit-id="${item.id}" title="Edit"><i data-lucide="pencil"></i></button>
            <button class="btn-card-action btn-delete" data-delete-id="${item.id}" title="Delete"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
      `;

      // Drag events
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', item.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      if (status === 'pending') pendingList.appendChild(card);
      else if (status === 'in-progress') inProgressList.appendChild(card);
      else if (status === 'completed') completedList.appendChild(card);
    });

    document.getElementById('kanban-count-pending').textContent = counts.pending;
    document.getElementById('kanban-count-in-progress').textContent = counts['in-progress'];
    document.getElementById('kanban-count-completed').textContent = counts.completed;

    this.bindDeadlineCardActions();
    if (window.lucide) {
      lucide.createIcons({ root: document.getElementById('view-kanban') });
    }
  }

  static bindKanbanDropZones() {
    const dropZones = document.querySelectorAll('.kanban-cards-list');
    dropZones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        const newStatus = zone.dataset.dropStatus;
        if (id && newStatus) {
          StorageManager.updateStatus(id, newStatus);
          if (newStatus === 'completed') {
            NotificationManager.playChime('success');
            NotificationManager.triggerConfetti();
            NotificationManager.showToast('Task marked as submitted/completed! 🎉', 'success');
          }
          this.renderAll();
        }
      });
    });
  }

  // ==================== NOTICES HUB ====================

  static renderNotices() {
    const container = document.getElementById('notices-container');
    if (!container) return;

    let notices = StorageManager.getNotices();

    if (this.activeNoticeFilter !== 'all') {
      if (this.activeNoticeFilter === 'pinned') {
        notices = notices.filter(n => n.isPinned);
      } else {
        notices = notices.filter(n => n.category === this.activeNoticeFilter);
      }
    }

    container.innerHTML = '';

    if (notices.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p>No notices found under this category.</p>
        </div>
      `;
      return;
    }

    const categoryLabels = {
      ktu: '🏛️ KTU Official Bulletin',
      college: '🏫 College Department',
      cr: '📢 Class Rep (CR)'
    };

    notices.forEach(notice => {
      const card = document.createElement('div');
      card.className = `notice-card ${notice.isPinned ? 'notice-pinned' : ''}`;

      const dateStr = new Date(notice.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      card.innerHTML = `
        <div>
          ${notice.isPinned ? '<div class="pinned-ribbon"><i data-lucide="pin"></i> Pinned</div>' : ''}
          <span class="notice-source-tag">${categoryLabels[notice.category] || notice.category}</span>
          <h3 class="notice-title">${notice.title}</h3>
          <p class="notice-content">${notice.content}</p>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid var(--border-color); font-size: 0.75rem; color: var(--text-muted);">
          <span>Posted ${dateStr}</span>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            ${notice.link ? `<a href="${notice.link}" target="_blank" class="footer-link" style="color: var(--cyan-400);"><i data-lucide="external-link"></i> Portal</a>` : ''}
            <button class="btn-card-action btn-delete-notice" data-notice-id="${notice.id}" title="Delete notice"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    document.querySelectorAll('.btn-delete-notice').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.noticeId;
        if (confirm('Delete this notice?')) {
          StorageManager.deleteNotice(id);
          NotificationManager.showToast('Notice removed.', 'info');
          this.renderNotices();
          this.updateStats();
        }
      });
    });

    if (window.lucide) {
      lucide.createIcons({ root: container });
    }
  }

  // ==================== SUBJECT ANALYTICS ====================

  static renderAnalytics() {
    const container = document.getElementById('analytics-subjects-grid');
    if (!container) return;

    const deadlines = StorageManager.getDeadlines();
    const grouped = {};

    deadlines.forEach(item => {
      const key = item.subject;
      if (!grouped[key]) {
        grouped[key] = {
          subject: item.subject,
          courseCode: item.courseCode || '',
          totalTasks: 0,
          completedTasks: 0,
          totalMarks: 0,
          upcomingExams: []
        };
      }
      grouped[key].totalTasks++;
      if (item.status === 'completed') grouped[key].completedTasks++;
      if (item.marks) grouped[key].totalMarks += item.marks;
      if (item.type === 'exam' && item.status !== 'completed') {
        grouped[key].upcomingExams.push(item);
      }
    });

    const subjectKeys = Object.keys(grouped);
    container.innerHTML = '';

    if (subjectKeys.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p>No subjects tracked yet. Add your first deadline to generate analytics.</p>
        </div>
      `;
      return;
    }

    subjectKeys.forEach(key => {
      const data = grouped[key];
      const percent = Math.round((data.completedTasks / data.totalTasks) * 100);

      const card = document.createElement('div');
      card.className = 'subject-analytic-card';

      card.innerHTML = `
        <div class="subj-card-header">
          <h3 style="font-size: 1.0625rem; font-weight: 700;">${data.subject}</h3>
          ${data.courseCode ? `<span class="subj-code-pill">${data.courseCode}</span>` : ''}
        </div>

        <div class="subj-stats-row">
          <div>
            <div class="subj-stat-val text-cyan">${data.totalTasks}</div>
            <div class="subj-stat-lbl">Total Tasks</div>
          </div>
          <div>
            <div class="subj-stat-val text-emerald">${data.completedTasks}</div>
            <div class="subj-stat-lbl">Completed</div>
          </div>
          <div>
            <div class="subj-stat-val text-amber">${data.totalMarks}</div>
            <div class="subj-stat-lbl">Internal Marks</div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
            <span style="color: var(--text-secondary);">Subject Completion</span>
            <span style="font-weight: 700; color: var(--text-primary);">${percent}%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
        </div>

        ${data.upcomingExams.length > 0 ? `
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; font-size: 0.75rem; color: var(--amber-400); display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i>
            <span>Exam Scheduled: ${data.upcomingExams[0].title}</span>
          </div>
        ` : ''}
      `;

      container.appendChild(card);
    });

    if (window.lucide) {
      lucide.createIcons({ root: container });
    }
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
