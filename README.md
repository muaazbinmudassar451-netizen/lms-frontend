# LearnFlow LMS — React Frontend

## ⚡ Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API URL
```bash
cp .env.example .env
# Edit .env → VITE_API_URL=http://localhost:8000/api
```

### 3. Start development server
```bash
npm run dev
# Runs at http://localhost:5173
```

> **Make sure Laravel backend is running first!**

---

## 🔐 Demo Login Credentials

| Role       | Email                  | Password       |
|------------|------------------------|----------------|
| 🛡️ Admin     | admin@lms.com          | admin123       |
| 👨‍🏫 Instructor | instructor@lms.com     | instructor123  |
| 👨‍🎓 Student   | student@lms.com        | student123     |

---

## 🗂️ Project Structure

```
src/
├── services/
│   └── api.js              # All API calls (fetch wrapper)
├── store/
│   ├── authStore.js        # Auth state (Zustand) — login/logout/users
│   └── lmsStore.js         # LMS data (Zustand) — courses/lessons/quizzes
├── components/
│   └── Layout.jsx          # Sidebar + topbar
├── pages/
│   ├── LoginPage.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── UsersPage.jsx
│   │   └── AdminPages.jsx
│   ├── instructor/
│   │   ├── InstructorPages.jsx
│   │   ├── LessonsPage.jsx
│   │   └── QuizzesPage.jsx
│   ├── shared/
│   │   └── CoursesPage.jsx
│   └── student/
│       └── StudentPages.jsx
├── App.jsx                 # Role-based routing + init
└── App.css                 # Full dark theme styles
```

---

## 🔌 API Connection

All requests go through `src/services/api.js`:
- Bearer token stored in `localStorage` after login
- Auto-attached to every request via Authorization header
- Session restored on page refresh via `GET /api/me`
