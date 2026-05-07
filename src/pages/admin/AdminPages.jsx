import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLmsStore } from '../../store/lmsStore';

export function AdminEnrollmentsPage() {
  const users = useAuthStore(s => s.users);
  const { courses, enrollments, fetchAllEnrollments } = useLmsStore();
  const { fetchUsers } = useAuthStore();

  useEffect(() => { fetchAllEnrollments(); fetchUsers(); }, []);

  return (
    <div className="page-section">
      <div className="section-header">
        <div><h2>Enrollments</h2><p className="section-sub">{enrollments.length} total enrollment records</p></div>
      </div>
      <div className="users-table">
        <div className="table-header"><span>Student</span><span>Course</span><span>Enrolled</span><span>Progress</span></div>
        {enrollments.map((e,i)=>{
          const student = users.find(u=>u.id===e.student_id) || e.student;
          const course  = courses.find(c=>c.id===e.course_id) || e.course;
          return (
            <div key={i} className="table-row">
              <span className="user-cell-lg">
                <div className="user-avatar-sm" style={{background:'#10b981'}}>{student?.avatar||student?.name?.[0]||'?'}</div>
                <div><p className="user-name-text">{student?.name||'Unknown'}</p></div>
              </span>
              <span>{course?.thumbnail} {course?.title||'Unknown'}</span>
              <span className="muted">{e.enrolled_at?.split('T')[0]||e.enrolled_at}</span>
              <span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div className="mini-progress" style={{width:120}}><div style={{width:`${e.progress}%`,background:'#10b981'}} /></div>
                  <span className="small">{e.progress}%</span>
                </div>
              </span>
            </div>
          );
        })}
        {enrollments.length===0&&<div className="empty-state">No enrollments yet</div>}
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { users, fetchUsers } = useAuthStore();
  const { courses, enrollments, attempts, quizzes, lessons, fetchCourses, fetchAllEnrollments } = useLmsStore();

  useEffect(() => { fetchUsers(); fetchCourses(); fetchAllEnrollments(); }, []);

  const avgProgress = enrollments.length ? Math.round(enrollments.reduce((s,e)=>s+e.progress,0)/enrollments.length) : 0;
  const avgScore    = attempts.length    ? Math.round(attempts.reduce((s,a)=>s+(a.score/a.max_score)*100,0)/attempts.length) : 0;
  const estRevenue  = enrollments.length * 49;

  const topCourses = courses.map(c=>({
    ...c,
    enrollCount: enrollments.filter(e=>e.course_id===c.id).length,
    lessonCount: lessons.filter(l=>l.course_id===c.id).length,
  })).sort((a,b)=>b.enrollCount-a.enrollCount);

  return (
    <div className="page-section">
      <div className="section-header">
        <div><h2>System Reports</h2><p className="section-sub">Platform analytics and performance data</p></div>
      </div>

      <div className="stats-grid">
        {[
          { label:'Est. Revenue', value:`$${estRevenue.toLocaleString()}`, icon:'💰', color:'#10b981' },
          { label:'Avg Progress', value:`${avgProgress}%`,                 icon:'📈', color:'#6366f1' },
          { label:'Avg Quiz Score',value:`${avgScore}%`,                   icon:'🏆', color:'#f59e0b' },
          { label:'Total Lessons', value:lessons.length,                   icon:'📝', color:'#ef4444' },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{'--accent':s.color}}>
            <div className="stat-icon" style={{background:s.color+'22'}}>{s.icon}</div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
            <div className="stat-bar" style={{background:s.color}} />
          </div>
        ))}
      </div>

      <div className="dash-card full-width">
        <h3>📚 Course Performance Report</h3>
        <div className="users-table">
          <div className="table-header"><span>Course</span><span>Category</span><span>Instructor</span><span>Students</span><span>Lessons</span><span>Status</span></div>
          {topCourses.map(c=>{
            const instructor = users.find(u=>u.id===c.instructor_id)||c.instructor;
            return (
              <div key={c.id} className="table-row">
                <span className="user-cell-lg"><span className="mini-thumb">{c.thumbnail}</span><p className="user-name-text">{c.title}</p></span>
                <span className="muted">{c.category}</span>
                <span className="muted">{instructor?.name||'—'}</span>
                <span><strong>{c.enrollCount}</strong></span>
                <span><strong>{c.lessonCount}</strong></span>
                <span><span className={`status-badge status-${c.status}`}>{c.status}</span></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
