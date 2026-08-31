/**
 * storage.js - LocalStorage Persistence & State Management for KTU Academic Assistant
 */

const STORAGE_KEYS = {
  DEADLINES: 'ktu_deadlines_v1',
  NOTICES: 'ktu_notices_v1',
  THEME: 'ktu_theme_v1',
  NOTIFICATIONS: 'ktu_notifications_v1',
  DISMISSED_BANNER: 'ktu_dismissed_banner_v1'
};

// Preset KTU Curriculum Data (S5/S6 CSE Sample)
const SAMPLE_DEADLINES = [
  {
    id: 'demo-1',
    subject: 'Database Management Systems',
    courseCode: 'CST303',
    title: 'Lab Record Submission (PL/SQL Triggers)',
    type: 'lab',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(), // ~28 hours from now
    priority: 'high',
    status: 'pending',
    marks: 15,
    link: 'https://classroom.google.com',
    notes: 'Include all screenshots of SQL execution. Must have teacher sign-off on rough record.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-2',
    subject: 'Artificial Intelligence',
    courseCode: 'CST301',
    title: 'Assignment 1: A* and Minimax Search Trees',
    type: 'assignment',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 46).toISOString(), // ~46 hours from now
    priority: 'high',
    status: 'in-progress',
    marks: 10,
    link: 'https://classroom.google.com',
    notes: 'Handwritten PDF upload on Google Classroom. Maximum 6 pages.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-3',
    subject: 'Machine Learning',
    courseCode: 'CST305',
    title: 'Mini Project Phase 1 Presentation & Synopsis',
    type: 'project',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
    priority: 'high',
    status: 'in-progress',
    marks: 25,
    link: 'https://github.com',
    notes: 'Prepare 10 slides PPT with dataset description, literature review, and system architecture diagram.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-4',
    subject: 'Computer Networks',
    courseCode: 'CST307',
    title: 'First Internal Series Examination',
    type: 'exam',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days
    priority: 'high',
    status: 'pending',
    marks: 50,
    link: '',
    notes: 'Modules 1 and 2 (OSI vs TCP/IP, Data Link Layer protocols, Sliding Window).',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-5',
    subject: 'KTU University Portal',
    courseCode: 'KTU-PORTAL',
    title: 'Odd Semester Examination Registration & Fee Payment',
    type: 'registration',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days
    priority: 'high',
    status: 'pending',
    marks: 0,
    link: 'https://app.ktu.edu.in',
    notes: 'Log in to KTU student login portal. Verify registered courses before fee payment.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-6',
    subject: 'Industrial Economics & Foreign Trade',
    courseCode: 'HUT300',
    title: 'Assignment: Demand Forecasting Case Study',
    type: 'assignment',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days
    priority: 'medium',
    status: 'pending',
    marks: 10,
    link: '',
    notes: 'Individual submission. Case study on Indian automobile industry elasticity of demand.',
    createdAt: new Date().toISOString()
  }
];

const SAMPLE_NOTICES = [
  {
    id: 'notice-1',
    title: 'KTU B.Tech S5/S7 Regular & Supplementary Exam Registration Schedule',
    category: 'ktu',
    content: 'University notification dated 28-Aug-2026: Student registration for Odd Semester University Examinations without fine ends on 10-Sep-2026. With fine of Rs 500/- up to 14-Sep-2026.',
    link: 'https://ktu.edu.in',
    isPinned: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notice-2',
    title: 'Class Rep Notice: Internal Marks Verification & Sign-off on Friday',
    category: 'cr',
    content: 'All class students must check their attendance percentage and Series 1 marks entered on the college portal by Thursday evening. Report discrepancies to respective faculty advisors.',
    link: '',
    isPinned: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notice-3',
    title: 'College Department: Mini Project Evaluation Committee Schedule',
    category: 'college',
    content: 'The Phase 1 review for B.Tech CSE Mini Projects will be conducted by departmental review panel on September 18th in Lab 3.',
    link: '',
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'notice-4',
    title: 'KTU Activity Points Submission Window Open',
    category: 'ktu',
    content: 'Upload certificates for NSS, NPTEL, sports, cultural and tech fest participation on the KTU portal for activity point verification (min 100 required for B.Tech degree).',
    link: 'https://app.ktu.edu.in',
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  }
];

class StorageManager {
  /**
   * Initializes storage with defaults if empty
   */
  static init() {
    if (!localStorage.getItem(STORAGE_KEYS.DEADLINES)) {
      this.saveDeadlines(SAMPLE_DEADLINES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
      this.saveNotices(SAMPLE_NOTICES);
    }
  }

  // ==================== DEADLINES ====================

  static getDeadlines() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEADLINES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse deadlines from localStorage:', e);
      return [];
    }
  }

  static saveDeadlines(deadlines) {
    try {
      localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
      return true;
    } catch (e) {
      console.error('Failed to save deadlines to localStorage:', e);
      return false;
    }
  }

  static addDeadline(deadline) {
    const list = this.getDeadlines();
    const newDeadline = {
      id: deadline.id || 'dl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      ...deadline
    };
    list.unshift(newDeadline);
    this.saveDeadlines(list);
    return newDeadline;
  }

  static updateDeadline(id, updatedFields) {
    const list = this.getDeadlines();
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields, updatedAt: new Date().toISOString() };
      this.saveDeadlines(list);
      return list[index];
    }
    return null;
  }

  static deleteDeadline(id) {
    const list = this.getDeadlines();
    const filtered = list.filter(item => item.id !== id);
    this.saveDeadlines(filtered);
    return filtered;
  }

  static updateStatus(id, newStatus) {
    return this.updateDeadline(id, { status: newStatus });
  }

  // ==================== NOTICES ====================

  static getNotices() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse notices from localStorage:', e);
      return [];
    }
  }

  static saveNotices(notices) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
      return true;
    } catch (e) {
      console.error('Failed to save notices to localStorage:', e);
      return false;
    }
  }

  static addNotice(notice) {
    const list = this.getNotices();
    const newNotice = {
      id: 'notice-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...notice
    };
    if (newNotice.isPinned) {
      list.unshift(newNotice);
    } else {
      const firstUnpinned = list.findIndex(n => !n.isPinned);
      if (firstUnpinned === -1) {
        list.push(newNotice);
      } else {
        list.splice(firstUnpinned, 0, newNotice);
      }
    }
    this.saveNotices(list);
    return newNotice;
  }

  static deleteNotice(id) {
    const list = this.getNotices();
    const filtered = list.filter(item => item.id !== id);
    this.saveNotices(filtered);
    return filtered;
  }

  // ==================== PRESETS & DATA MANAGEMENT ====================

  static loadSampleData() {
    this.saveDeadlines(SAMPLE_DEADLINES);
    this.saveNotices(SAMPLE_NOTICES);
  }

  static clearAll() {
    localStorage.removeItem(STORAGE_KEYS.DEADLINES);
    localStorage.removeItem(STORAGE_KEYS.NOTICES);
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify([]));
  }

  /**
   * Export all data as downloadable JSON
   */
  static exportBackupJSON() {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      deadlines: this.getDeadlines(),
      notices: this.getNotices()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ktu-academic-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import data from JSON file content
   */
  static importBackupJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.deadlines && Array.isArray(parsed.deadlines)) {
        this.saveDeadlines(parsed.deadlines);
      }
      if (parsed.notices && Array.isArray(parsed.notices)) {
        this.saveNotices(parsed.notices);
      }
      return { success: true, count: (parsed.deadlines?.length || 0) };
    } catch (e) {
      console.error('Import error:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Generates standard iCalendar (.ics) format file from deadlines
   */
  static exportToICS() {
    const deadlines = this.getDeadlines();
    if (deadlines.length === 0) {
      return false;
    }

    const formatICSDate = (dateObj) => {
      const pad = (n) => (n < 10 ? '0' + n : n);
      return (
        dateObj.getUTCFullYear() +
        pad(dateObj.getUTCMonth() + 1) +
        pad(dateObj.getUTCDate()) +
        'T' +
        pad(dateObj.getUTCHours()) +
        pad(dateObj.getUTCMinutes()) +
        pad(dateObj.getUTCSeconds()) +
        'Z'
      );
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KTU Student Assistant//Academic Deadlines Tracker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:KTU Academic Deadlines'
    ];

    deadlines.forEach(dl => {
      const dueDate = new Date(dl.deadline);
      const startDate = new Date(dueDate.getTime() - 1000 * 60 * 60); // 1 hr duration
      const now = new Date();

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${dl.id}@ktu-assistant.local`,
        `DTSTAMP:${formatICSDate(now)}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(dueDate)}`,
        `SUMMARY:[KTU ${dl.courseCode || dl.subject}] ${dl.title}`,
        `DESCRIPTION:Category: ${dl.type.toUpperCase()}\\nPriority: ${dl.priority}\\nStatus: ${dl.status}\\nNotes: ${dl.notes || 'None'}`,
        `STATUS:${dl.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`,
        'BEGIN:VALARM',
        'TRIGGER:-P2D',
        'DESCRIPTION:KTU Deadline in 2 Days Reminder',
        'ACTION:DISPLAY',
        'END:VALARM',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ktu-deadlines-calendar-${new Date().toISOString().slice(0,10)}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }
}

// Automatically initialize on load
StorageManager.init();
