# 🎓 KTU Student Academic Assistant & Deadline Tracker

> **A centralized, privacy-first academic deadline, examination, project, and notice tracker designed specifically for APJ Abdul Kalam Technological University (KTU) B.Tech students, Class Representatives (CRs), and faculty.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![KTU Scheme](https://img.shields.io/badge/KTU-2019%20%2F%202024%20Scheme-emerald.svg)](https://ktu.edu.in)
[![No Framework Dependency](https://img.shields.io/badge/Vanilla-HTML5%20%7C%20CSS3%20%7C%20ES6-cyan.svg)](#technology-stack)
[![Zero Backend Required](https://img.shields.io/badge/Offline%20First-LocalStorage-indigo.svg)](#features)

---

## 📌 1. The Problem

KTU engineering students receive crucial academic announcements across multiple scattered platforms:
* 💬 **WhatsApp Class & Department Groups** (messages get buried in casual chats)
* 🏫 **College Portals & Internal ERPs**
* 🏛️ **Official KTU Announcements** (`ktu.edu.in` & `app.ktu.edu.in`)
* 📚 **Google Classroom / Moodle** (assignments with differing submission dates)

Because this critical information is fragmented, students frequently miss:
- ❌ **Assignment deadlines & Lab record submissions** (resulting in loss of internal assessment marks)
- ❌ **KTU University Exam registrations & fee payment windows** (incurring steep fines)
- ❌ **Series Tests (Series 1 & 2) and Retest Schedules**
- ❌ **Mini / Major Project milestone presentations**
- ❌ **KTU Activity Point certificate submissions** (100 points mandatory for B.Tech degree)

---

## 🎯 2. Who Faces It?

1. **KTU B.Tech Students** managing 6–8 concurrent subjects, labs, and project deadlines each semester.
2. **Class Representatives (CRs)** tasked with repeatedly broadcasting deadlines and reminding classmates.
3. **Faculty Members & Staff Advisors** seeking punctual student submissions to calculate internal marks.
4. **Project Groups** coordinating multi-phase deliverables.

---

## 💡 3. What We Built

A **lightweight, offline-capable, and visually stunning web application** that unifies all academic responsibilities into one dashboard.

```
KTU / College Notices ➔ Important Dates ➔ Assignments ➔ Exams ➔ Projects ➔ Smart Reminders
```

### 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| 🚨 **"Due in 2 Days" Smart Engine** | Automatically detects approaching deadlines (&le; 48 hours) and highlights them with pulsing urgency cues. |
| 🔔 **Web Notification API** | Browser alerts for upcoming exams, assignments, and registration dates without requiring app installation. |
| 📌 **Kanban Pipeline Board** | Interactive drag-and-drop board (`Pending` ➔ `In Progress` ➔ `Completed`). |
| 📅 **Academic Calendar View** | Monthly calendar with color-coded day markers (Exams, Labs, Projects, Assignments) and quick-add support. |
| 🏛️ **KTU & CR Notices Bulletin** | Pinned feed for official university circulars, fee notifications, and custom CR class broadcasts. |
| 📊 **Subject Analytics & Internals** | Automatic internal marks tracker and completion meter per KTU subject code (e.g., `CST301`, `CST303`). |
| 📲 **iCalendar (.ICS) Export** | One-click synchronization with **Google Calendar**, **Apple Calendar**, and **Microsoft Outlook**. |
| 💾 **JSON Backup & Restore** | Export and import your entire academic workspace to share with classmates or switch devices. |
| 🌓 **Dark & Light Mode** | Modern glassmorphic dark mode default with persistent theme toggle. |

---

## 🎤 4. What You Can Say in Class (Presentation Script)

> *"Good morning respected faculty and dear friends,*
>
> *One common challenge every KTU student faces is scattered information. Crucial deadlines are spread across WhatsApp groups, Google Classroom, college portals, and KTU notifications. As a result, students miss assignment deadlines, registration dates, or lab records, which directly damages internal marks.*
>
> *To solve this, we designed the **KTU Student Academic Assistant**—a centralized academic hub where students can track assignments, series exams, lab records, and university notices in one unified dashboard.*
>
> *For our initial MVP, students can add upcoming deadlines, track tasks through an interactive Kanban pipeline and calendar, and receive automated 'Due in 2 Days' reminders and browser notifications. We also support one-click sync to Google Calendar and full offline storage.*
>
> *Because it operates locally on modern browser standards without requiring heavy server infrastructure, it is fast, privacy-friendly, and ready for every KTU student to use today."*

---

## ⚡ 5. Quick Start & Git Setup

### Clone and Run Locally

```bash
# 1. Clone this repository
git clone https://github.com/your-username/ktu-academic-assistant.git

# 2. Navigate to project folder
cd ktu-academic-assistant

# 3. Open directly in any modern browser
# On macOS:
open index.html
# On Linux:
xdg-open index.html
# On Windows:
start index.html
```

### Or Run with Dev Server:
```bash
# Using Node.js (npx)
npx serve . -l 3000

# Open http://localhost:3000 in your browser
```

---

## 🏗️ 6. Technology Stack & Architecture

```
ktu-academic-assistant/
├── index.html          # Semantic HTML5 UI layout, modals, and tabs
├── css/
│   └── style.css       # Custom design system tokens, glassmorphism, responsive grid
├── js/
│   ├── app.js          # Main UI controller, filters, search, drag & drop, analytics
│   ├── storage.js      # LocalStorage manager, KTU S5/S6 presets, .ICS & JSON export
│   ├── notifications.js# Web Notification API, countdown calculator, Web Audio synthesis
│   └── calendar.js     # Monthly interactive calendar generator
├── package.json        # Project metadata and quick-start scripts
├── .gitignore          # Git exclusion rules
├── LICENSE             # MIT License
└── README.md           # Project documentation & classroom pitch
```

* **Frontend**: Vanilla HTML5 + CSS3 (Design Tokens + Glassmorphism)
* **Logic**: Vanilla ES6 JavaScript (Zero heavy framework bloat)
* **Icons**: [Lucide Icons](https://lucide.dev)
* **Sound Engine**: Web Audio API (Synthesizes chime sounds without MP3 assets)
* **Calendar Standard**: RFC 5545 iCalendar (`.ics`) format
* **Storage**: Browser `localStorage` (100% offline, zero server requirement)

---

## 🚀 7. Deployment to GitHub Pages

Deploy your tracker live for your class in under 1 minute:

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial release of KTU Student Academic Assistant"
   git branch -M main
   git remote add origin https://github.com/your-username/ktu-academic-assistant.git
   git push -u origin main
   ```
2. On GitHub, go to your repository **Settings** ➔ **Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your tracker will be live at `https://your-username.github.io/ktu-academic-assistant/`!

---

## 🗺️ 8. Future Roadmap

- [ ] **KTU Portal Web Scraper / RSS Feed**: Automated fetching of official KTU circulars.
- [ ] **WhatsApp & Telegram Bot Integration**: Forwarding class notices directly to the tracker via webhook.
- [ ] **KTU CGPA & SGPA Calculator**: Built-in 2019/2024 scheme grade point estimation.
- [ ] **Peer-to-Peer CR Sync**: Share class deadline boards via QR code or WebRTC.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
Built with ❤️ for the KTU student community.
