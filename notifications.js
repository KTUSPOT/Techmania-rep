/**
 * notifications.js - Smart Reminders, Web Notifications & Web Audio Synthesizer
 */

class NotificationManager {
  static audioCtx = null;
  static checkInterval = null;

  /**
   * Initializes browser notification checks and listeners
   */
  static init() {
    this.updateNotificationButtonState();
    this.startBackgroundReminderCheck();
  }

  /**
   * Checks current Notification permission
   */
  static getPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Requests browser notification permissions
   */
  static async requestPermission() {
    if (!('Notification' in window)) {
      this.showToast('Browser notifications are not supported in this browser.', 'warning');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.updateNotificationButtonState();

      if (permission === 'granted') {
        this.showToast('Deadline notifications enabled! You will receive alerts for approaching submissions.', 'success');
        this.sendSystemNotification('KTU Academic Assistant', {
          body: 'Notifications are active! We will remind you 48 hours and 24 hours before deadlines.',
          icon: '🎓'
        });
        return true;
      } else {
        this.showToast('Notifications permission was dismissed or denied.', 'info');
        return false;
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  }

  /**
   * Updates the header bell button text and styling based on permissions
   */
  static updateNotificationButtonState() {
    const btn = document.getElementById('btn-notification-toggle');
    const label = document.getElementById('notif-btn-label');
    const bellIcon = document.getElementById('bell-icon');
    if (!btn || !label) return;

    const perm = this.getPermission();
    if (perm === 'granted') {
      label.textContent = 'Alerts Active';
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-ghost');
      btn.style.color = 'var(--emerald-400)';
    } else if (perm === 'denied') {
      label.textContent = 'Alerts Blocked';
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-ghost');
      btn.style.color = 'var(--rose-400)';
    } else {
      label.textContent = 'Enable Alerts';
      btn.classList.add('btn-secondary');
      btn.classList.remove('btn-ghost');
      btn.style.color = '';
    }
  }

  /**
   * Triggers a native desktop/mobile notification if granted
   */
  static sendSystemNotification(title, options = {}) {
    if (this.getPermission() === 'granted') {
      try {
        const notif = new Notification(title, {
          badge: '🎓',
          silent: false,
          ...options
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn('System notification failed:', e);
      }
    }
  }

  /**
   * Formats remaining time until deadline with urgency classifications
   */
  static getRemainingTime(deadlineDateStr, status = 'pending') {
    if (status === 'completed') {
      return {
        formatted: 'Completed',
        category: 'done',
        isUrgent: false,
        isOverdue: false,
        hoursLeft: 9999
      };
    }

    const now = new Date().getTime();
    const due = new Date(deadlineDateStr).getTime();
    const diff = due - now;

    if (isNaN(diff)) {
      return {
        formatted: 'No Date Set',
        category: 'normal',
        isUrgent: false,
        isOverdue: false,
        hoursLeft: 9999
      };
    }

    // Overdue
    if (diff < 0) {
      const pastSeconds = Math.abs(Math.floor(diff / 1000));
      const pastHours = Math.floor(pastSeconds / 3600);
      const pastDays = Math.floor(pastHours / 24);

      let text = 'Overdue';
      if (pastDays > 0) {
        text = `Overdue by ${pastDays}d`;
      } else if (pastHours > 0) {
        text = `Overdue by ${pastHours}h`;
      } else {
        text = 'Overdue by mins';
      }

      return {
        formatted: text,
        category: 'overdue',
        isUrgent: true,
        isOverdue: true,
        hoursLeft: 0
      };
    }

    // Future
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let formatted = '';
    let category = 'normal';
    let isUrgent = false;

    if (days >= 2) {
      formatted = `${days} days left`;
      category = days <= 3 ? 'soon' : 'normal';
    } else if (days === 1) {
      formatted = `1 day left (${hours % 24}h)`;
      category = 'urgent';
      isUrgent = true;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes % 60}m left`;
      category = 'urgent';
      isUrgent = true;
    } else {
      formatted = `${minutes} mins left!`;
      category = 'urgent';
      isUrgent = true;
    }

    return {
      formatted,
      category,
      isUrgent,
      isOverdue: false,
      hoursLeft: hours + (minutes / 60)
    };
  }

  /**
   * Periodic reminder daemon checking for approaching deadlines
   */
  static startBackgroundReminderCheck() {
    const check = () => {
      const deadlines = StorageManager.getDeadlines();
      const now = Date.now();

      deadlines.forEach(item => {
        if (item.status === 'completed') return;
        const dueTime = new Date(item.deadline).getTime();
        const diffHours = (dueTime - now) / (1000 * 60 * 60);

        // Check if within 48 hours and not already alerted this session
        const alertKey = `alerted_${item.id}_${Math.floor(diffHours / 24)}`;
        if (diffHours > 0 && diffHours <= 48 && !sessionStorage.getItem(alertKey)) {
          sessionStorage.setItem(alertKey, 'true');

          const timeLabel = diffHours <= 24 ? 'Less than 24 Hours' : '2 Days';
          this.sendSystemNotification(`⏰ KTU Deadline Alert: ${item.subject}`, {
            body: `${item.title} is due in ${timeLabel}! Complete and submit soon.`
          });
        }
      });
    };

    // Run check every 5 minutes
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(check, 5 * 60 * 1000);
    // Initial check after 3 seconds
    setTimeout(check, 3000);
  }

  /**
   * Plays a synthesized audio chime via Web Audio API (Zero external MP3 dependencies)
   */
  static playChime(type = 'success') {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'success') {
        // High pleasant major chord arpeggio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'urgent') {
        // Soft double beep
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      console.warn('Audio synthesis not permitted or failed:', e);
    }
  }

  /**
   * Triggers celebratory confetti
   */
  static triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#38bdf8', '#10b981', '#fbbf24', '#f43f5e']
      });
    }
  }

  /**
   * Renders sleek toast popup
   */
  static showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'error') iconName = 'x-circle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) {
      lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
}

// Auto init on load
NotificationManager.init();
