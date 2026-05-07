import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

const navConfig = {
  admin: [
    { icon: '📊', label: 'Dashboard', view: 'dashboard' },
    { icon: '👥', label: 'Manage Users', view: 'users' },
    { icon: '📚', label: 'All Courses', view: 'courses' },
    { icon: '📋', label: 'Enrollments', view: 'enrollments' },
    { icon: '📈', label: 'Reports', view: 'reports' },
  ],
  instructor: [
    { icon: '📊', label: 'Dashboard', view: 'dashboard' },
    { icon: '📚', label: 'My Courses', view: 'courses' },
    { icon: '📝', label: 'Lessons', view: 'lessons' },
    { icon: '❓', label: 'Quizzes', view: 'quizzes' },
    { icon: '👨‍🎓', label: 'My Students', view: 'students' },
  ],
  student: [
    { icon: '📊', label: 'Dashboard', view: 'dashboard' },
    { icon: '🔍', label: 'Browse Courses', view: 'browse' },
    { icon: '📚', label: 'My Courses', view: 'my-courses' },
    { icon: '❓', label: 'My Quizzes', view: 'my-quizzes' },
    { icon: '📈', label: 'My Progress', view: 'progress' },
  ],
};

export default function Layout({ currentView, setView, children }) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = navConfig[user.role] || [];

  const roleColors = { admin: '#ef4444', instructor: '#8b5cf6', student: '#10b981' };
  const roleEmoji = { admin: '🛡️', instructor: '👨‍🏫', student: '👨‍🎓' };

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-logo">🎓</span>
            {sidebarOpen && <span className="sidebar-title">LearnFlow</span>}
          </div>
          <button className="sidebar-toggle desktop-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: roleColors[user.role] }}>
            {user.avatar}
          </div>
          {sidebarOpen && (
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <span className="role-badge" style={{ background: roleColors[user.role] }}>
                {roleEmoji[user.role]} {user.role}
              </span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => (
            <button
              key={item.view}
              className={`nav-item ${currentView === item.view ? 'active' : ''}`}
              onClick={() => { setView(item.view); setMobileOpen(false); }}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
              {currentView === item.view && <span className="nav-active-bar" />}
            </button>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <span>🚪</span>
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
          <div className="topbar-title">
            <span>{nav.find(n => n.view === currentView)?.icon}</span>
            <h2>{nav.find(n => n.view === currentView)?.label || 'Dashboard'}</h2>
          </div>
          <div className="topbar-right">
            <div className="topbar-user" style={{ borderColor: roleColors[user.role] }}>
              <span style={{ background: roleColors[user.role] }} className="topbar-avatar">{user.avatar}</span>
              <span className="topbar-name">{user.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
