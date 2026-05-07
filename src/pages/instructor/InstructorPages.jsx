import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLmsStore } from '../../store/lmsStore';

export function InstructorDashboard({ setView }) {
  const user = useAuthStore(s => s.user);
  const users = useAuthStore(s => s.users);
  const { courses, lessons, quizzes, enrollments, attempts, fetchCourses, fetchAllEnrollments } = useLmsStore();
  const { fetchUsers } = useAuthStore();

  useEffect(() => { fetchCourses(); fetchUsers(); fetchAllEnrollments(); }, []);

  const myCourses     = courses.filter(c=>c.instructor_id===user.id);
  const myCourseIds   = myCourses.map(c=>c.id);
  const myEnrollments = enrollments.filter(e=>myCourseIds.includes(e.course_id));
  const myQuizIds     = quizzes.filter(q=>myCourseIds.includes(q.course_id)).map(q=>q.id);
  const myAttempts    = attempts.filter(a=>myQuizIds.includes(a.quiz_id));

  const stats = [
    { label:'My Courses',   value:myCourses.length,     icon:'📚', color:'#8b5cf6' },
    { label:'Total Lessons',value:lessons.filter(l=>myCourseIds.includes(l.course_id)).length, icon:'📝', color:'#6366f1' },
    { label:'Students',     value:new Set(myEnrollments.map(e=>e.student_id)).size, icon:'👨‍🎓', color:'#10b981' },
    { label:'Quiz Attempts',value:myAttempts.length,    icon:'📊', color:'#f59e0b' },
  ];

  const avgScore = myAttempts.length
    ? Math.round(myAttempts.reduce((s,a)=>s+(a.score/a.max_score)*100,0)/myAttempts.length) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <div><h1>Welcome, {user.name.split(' ')[0]}! 👨‍🏫</h1><p>Manage your courses and track student progress</p></div>
        <button className="btn-primary" onClick={()=>setView('courses')}>+ New Course</button>
      </div>

      <div className="stats-grid">
        {stats.map(stat=>(
          <div key={stat.label} className="stat-card" style={{'--accent':stat.color}}>
            <div className="stat-icon" style={{background:stat.color+'22'}}>{stat.icon}</div>
            <div className="stat-info"><h3>{stat.value}</h3><p>{stat.label}</p></div>
            <div className="stat-bar" style={{background:stat.color}} />
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <h3>📚 My Courses</h3>
          {myCourses.slice(0,4).map(c=>{
            const enrolled = enrollments.filter(e=>e.course_id===c.id).length;
            return (
              <div key={c.id} className="mini-course-row">
                <span className="mini-thumb">{c.thumbnail}</span>
                <div className="mini-course-info"><p>{c.title}</p><span className="muted small">{enrolled} students · {c.status}</span></div>
                <span className={`status-dot status-${c.status}`} />
              </div>
            );
          })}
          {myCourses.length===0&&<p className="muted small">No courses yet.</p>}
          <button className="link-btn mt-2" onClick={()=>setView('courses')}>View all →</button>
        </div>

        <div className="dash-card">
          <h3>📊 Performance</h3>
          <div className="perf-center">
            <div className="score-circle">
              <span className="score-num">{avgScore}%</span>
              <span className="score-label">Avg Score</span>
            </div>
          </div>
          <p className="text-center muted small">{myAttempts.length} total quiz attempts</p>
          <button className="link-btn mt-2 text-center" onClick={()=>setView('students')}>View students →</button>
        </div>

        <div className="dash-card full-width">
          <h3>👨‍🎓 Recent Enrollments</h3>
          <div className="mini-table">
            <div className="mini-table-head"><span>Student</span><span>Course</span><span>Progress</span><span>Date</span></div>
            {myEnrollments.slice(0,5).map((e,i)=>{
              const student = users.find(u=>u.id===e.student_id)||e.student;
              const course  = myCourses.find(c=>c.id===e.course_id)||e.course;
              return (
                <div key={i} className="mini-table-row">
                  <span className="user-cell"><span className="mini-avatar" style={{background:'#10b981'}}>{student?.avatar||student?.name?.[0]||'?'}</span>{student?.name||'Unknown'}</span>
                  <span className="muted">{course?.thumbnail} {course?.title||'Unknown'}</span>
                  <div className="mini-progress-row">
                    <div className="mini-progress"><div style={{width:`${e.progress}%`,background:'#10b981'}} /></div>
                    <span className="small">{e.progress}%</span>
                  </div>
                  <span className="muted small">{e.enrolled_at?.split('T')[0]||e.enrolled_at}</span>
                </div>
              );
            })}
            {myEnrollments.length===0&&<p className="muted small" style={{padding:'12px'}}>No enrollments yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentsPage() {
  const user = useAuthStore(s => s.user);
  const { users, fetchUsers } = useAuthStore();
  const { courses, enrollments, attempts, quizzes, fetchCourses, fetchAllEnrollments } = useLmsStore();

  useEffect(() => { fetchUsers(); fetchCourses(); fetchAllEnrollments(); }, []);

  const myCourses     = courses.filter(c=>c.instructor_id===user.id);
  const myCourseIds   = myCourses.map(c=>c.id);
  const myEnrollments = enrollments.filter(e=>myCourseIds.includes(e.course_id));
  const studentIds    = [...new Set(myEnrollments.map(e=>e.student_id))];

  // Prefer fetched users list, fallback to embedded student objects in enrollments
  const getStudent = (id) => {
    return users.find(u=>u.id===id) ||
      myEnrollments.find(e=>e.student_id===id)?.student ||
      { id, name:`Student #${id}`, avatar:'?', email:'' };
  };

  return (
    <div className="page-section">
      <div className="section-header">
        <div><h2>My Students</h2><p className="section-sub">{studentIds.length} students enrolled in your courses</p></div>
      </div>

      <div className="students-grid">
        {studentIds.map(sid=>{
          const student          = getStudent(sid);
          const studentEnrolls   = myEnrollments.filter(e=>e.student_id===sid);
          const studentAttempts  = attempts.filter(a=>a.student_id===sid);
          const avgProgress      = studentEnrolls.length ? Math.round(studentEnrolls.reduce((s,e)=>s+e.progress,0)/studentEnrolls.length) : 0;
          const avgScore         = studentAttempts.length ? Math.round(studentAttempts.reduce((s,a)=>s+(a.score/a.max_score)*100,0)/studentAttempts.length) : null;

          return (
            <div key={sid} className="student-card">
              <div className="student-avatar" style={{background:'#10b981'}}>{student.avatar||student.name?.[0]||'?'}</div>
              <h4>{student.name}</h4>
              <p className="muted small">{student.email}</p>
              <div className="student-stats">
                <div className="s-stat"><span className="s-stat-val">{studentEnrolls.length}</span><span className="s-stat-label">Courses</span></div>
                <div className="s-stat"><span className="s-stat-val">{avgProgress}%</span><span className="s-stat-label">Progress</span></div>
                <div className="s-stat"><span className="s-stat-val">{avgScore!==null?`${avgScore}%`:'N/A'}</span><span className="s-stat-label">Avg Score</span></div>
              </div>
              <div className="student-courses">
                {studentEnrolls.map((e,i)=>{
                  const course = myCourses.find(c=>c.id===e.course_id)||e.course;
                  return (
                    <div key={i} className="student-course-row">
                      <span>{course?.thumbnail} {course?.title||'Unknown'}</span>
                      <div className="mini-progress"><div style={{width:`${e.progress}%`,background:'#8b5cf6'}} /></div>
                      <span className="small">{e.progress}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {studentIds.length===0&&(
          <div className="empty-state-large"><span>👨‍🎓</span><h3>No Students Yet</h3><p>Students will appear once they enroll in your courses</p></div>
        )}
      </div>
    </div>
  );
}
