import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLmsStore } from '../../store/lmsStore';

export default function AdminDashboard({ setView }) {
  const { users, fetchUsers } = useAuthStore();
  const { courses, enrollments, attempts, quizzes, fetchCourses, fetchAllEnrollments, fetchMyAttempts } = useLmsStore();

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchAllEnrollments();
  }, []);

  const stats = [
    { label:'Total Users',    value:users.length,       icon:'👥', color:'#6366f1', sub:`${users.filter(u=>u.role==='student').length} students` },
    { label:'Total Courses',  value:courses.length,     icon:'📚', color:'#10b981', sub:`${courses.filter(c=>c.status==='published').length} published` },
    { label:'Enrollments',    value:enrollments.length, icon:'📋', color:'#f59e0b', sub:'Active enrollments' },
    { label:'Quiz Attempts',  value:attempts.length,    icon:'📝', color:'#ef4444', sub:'Total attempts' },
  ];

  const roleData = [
    { role:'Admins',      count:users.filter(u=>u.role==='admin').length,      color:'#ef4444', emoji:'🛡️' },
    { role:'Instructors', count:users.filter(u=>u.role==='instructor').length, color:'#8b5cf6', emoji:'👨‍🏫' },
    { role:'Students',    count:users.filter(u=>u.role==='student').length,    color:'#10b981', emoji:'👨‍🎓' },
  ];

  const categoryStats = courses.reduce((acc,c) => { acc[c.category]=(acc[c.category]||0)+1; return acc; }, {});

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <div><h1>Admin Dashboard 🛡️</h1><p>System overview and management controls</p></div>
        <button className="btn-primary" onClick={()=>setView('users')}>Manage Users →</button>
      </div>

      <div className="stats-grid">
        {stats.map(stat=>(
          <div key={stat.label} className="stat-card" style={{'--accent':stat.color}}>
            <div className="stat-icon" style={{background:stat.color+'22'}}>{stat.icon}</div>
            <div className="stat-info"><h3>{stat.value}</h3><p>{stat.label}</p><span className="stat-sub">{stat.sub}</span></div>
            <div className="stat-bar" style={{background:stat.color}} />
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <h3>👥 User Distribution</h3>
          <div className="role-chart">
            {roleData.map(r=>(
              <div key={r.role} className="role-bar-row">
                <span className="role-label">{r.emoji} {r.role}</span>
                <div className="role-bar-track">
                  <div className="role-bar-fill" style={{width:`${users.length?((r.count/users.length)*100):0}%`,background:r.color}} />
                </div>
                <span className="role-count">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <h3>📚 Courses by Category</h3>
          <div className="category-grid">
            {Object.entries(categoryStats).map(([cat,count])=>(
              <div key={cat} className="category-item">
                <span className="cat-name">{cat}</span>
                <span className="cat-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card full-width">
          <h3>📋 Recent Users</h3>
          <div className="mini-table">
            <div className="mini-table-head"><span>Name</span><span>Email</span><span>Role</span><span>Action</span></div>
            {users.slice(0,5).map(u=>(
              <div key={u.id} className="mini-table-row">
                <span className="user-cell"><span className="mini-avatar" style={{background:u.role==='admin'?'#ef4444':u.role==='instructor'?'#8b5cf6':'#10b981'}}>{u.avatar||u.name[0]}</span>{u.name}</span>
                <span className="muted">{u.email}</span>
                <span className={`role-tag role-${u.role}`}>{u.role}</span>
                <button className="link-btn" onClick={()=>setView('users')}>View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
