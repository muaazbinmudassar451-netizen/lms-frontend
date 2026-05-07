import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLmsStore } from '../../store/lmsStore';

export function StudentDashboard({ setView }) {
  const user = useAuthStore(s => s.user);
  const { courses, enrollments, attempts, quizzes, fetchMyEnrollments, fetchMyAttempts } = useLmsStore();
  const myEnrollments = enrollments.filter(e => e.student_id === user.id);
  const myAttempts = attempts.filter(a => a.student_id === user.id);
  const avgProgress = myEnrollments.length ? Math.round(myEnrollments.reduce((s,e)=>s+e.progress,0)/myEnrollments.length) : 0;
  const avgScore = myAttempts.length ? Math.round(myAttempts.reduce((s,a)=>s+(a.score/a.max_score)*100,0)/myAttempts.length) : 0;

  const stats = [
    { label:'Enrolled Courses', value:myEnrollments.length, icon:'📚', color:'#10b981' },
    { label:'Avg Progress', value:`${avgProgress}%`, icon:'📈', color:'#6366f1' },
    { label:'Quizzes Taken', value:myAttempts.length, icon:'❓', color:'#f59e0b' },
    { label:'Avg Quiz Score', value:`${avgScore}%`, icon:'🏆', color:'#ef4444' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <div><h1>Hello, {user.name.split(' ')[0]}! 👨‍🎓</h1><p>Continue your learning journey today</p></div>
        <button className="btn-primary" onClick={()=>setView('browse')}>Browse Courses →</button>
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
      <div className="dash-card full-width">
        <h3>📚 My Enrolled Courses</h3>
        <div className="enrolled-mini-grid">
          {myEnrollments.slice(0,4).map(e=>{
            const course = courses.find(c=>c.id===e.course_id);
            return (
              <div key={e.id} className="enrolled-mini-card" onClick={()=>setView('my-courses')}>
                <span className="mini-thumb-lg">{course?.thumbnail}</span>
                <div><p className="bold">{course?.title}</p><span className="muted small">{course?.category}</span></div>
                <div className="progress-section">
                  <div className="progress-bar-full"><div style={{width:`${e.progress}%`,background:'#10b981'}} /></div>
                  <span className="small">{e.progress}%</span>
                </div>
              </div>
            );
          })}
          {myEnrollments.length===0&&<div className="empty-state"><p>No courses yet. <button className="link-btn" onClick={()=>setView('browse')}>Browse now →</button></p></div>}
        </div>
      </div>
    </div>
  );
}

export function BrowseCoursesPage() {
  const user = useAuthStore(s => s.user);
  const { courses, enrollments, enroll, fetchCourses } = useLmsStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [enrolling, setEnrolling] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchCourses(); }, []);

  const published = courses.filter(c => c.status === 'published');
  const filtered = published.filter(c =>
    (catFilter==='all'||c.category===catFilter) && c.title.toLowerCase().includes(search.toLowerCase())
  );
  const categories = [...new Set(published.map(c=>c.category))];
  const isEnrolled = (courseId) => enrollments.some(e => e.course_id === courseId);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await enroll(courseId);
      setToast('✅ Successfully enrolled!');
    } catch(e) {
      setToast(e.message.includes('Already')||e.message.includes('409') ? '⚠️ Already enrolled' : '❌ '+e.message);
    }
    setEnrolling(null);
    setTimeout(()=>setToast(''), 3000);
  };

  return (
    <div className="page-section">
      {toast&&<div className="toast">{toast}</div>}
      <div className="section-header">
        <div><h2>Browse Courses</h2><p className="section-sub">{filtered.length} courses available</p></div>
      </div>
      <div className="filters-bar">
        <input className="search-input" placeholder="🔍 Search courses..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div className="filter-tabs">
          <button className={`filter-tab ${catFilter==='all'?'active':''}`} onClick={()=>setCatFilter('all')}>All</button>
          {categories.map(cat=><button key={cat} className={`filter-tab ${catFilter===cat?'active':''}`} onClick={()=>setCatFilter(cat)}>{cat}</button>)}
        </div>
      </div>
      <div className="courses-grid">
        {filtered.map(course=>{
          const enrolled = isEnrolled(course.id);
          return (
            <div key={course.id} className={`course-card browse-card ${enrolled?'enrolled':''}`}>
              {enrolled&&<div className="enrolled-ribbon">✅ Enrolled</div>}
              <div className="course-thumbnail">{course.thumbnail}</div>
              <div className="course-card-body">
                <div className="course-meta-top">
                  <span className="level-badge">{course.level}</span>
                  <span className="course-tag">📁 {course.category}</span>
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                {course.instructor&&<div className="instructor-row"><span className="mini-avatar" style={{background:'#8b5cf6'}}>{course.instructor.avatar||course.instructor.name[0]}</span><span className="muted small">{course.instructor.name}</span></div>}
                <div className="course-tags">
                  <span className="course-tag">⏱️ {course.duration}</span>
                  <span className="course-tag">👥 {course.enrollments_count??0} enrolled</span>
                </div>
              </div>
              <div className="course-card-actions">
                {enrolled
                  ? <button className="btn-enrolled" disabled>✅ Enrolled</button>
                  : <button className="btn-enroll" onClick={()=>handleEnroll(course.id)} disabled={enrolling===course.id}>
                      {enrolling===course.id?<><span className="spinner-sm"/> Enrolling...</>:'🎓 Enroll Now'}
                    </button>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MyCoursesPage() {
  const user = useAuthStore(s => s.user);
  const { courses, lessons, enrollments, fetchLessons, unenroll, updateProgress } = useLmsStore();
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [loadingLessons, setLoadingLessons] = useState(null);

  const myEnrollments = enrollments;

  const openLesson = async (lesson, course, enrollment) => {
    setActiveLesson(lesson);
    setActiveCourse({ course, enrollment });
    const total = lessons.filter(l=>l.course_id===course.id).length;
    const newPct = Math.max(enrollment.progress, Math.round((lesson.order/total)*100));
    if (newPct > enrollment.progress) {
      try { await updateProgress(course.id, newPct); } catch {}
    }
  };

  const loadLessons = async (course) => {
    setLoadingLessons(course.id);
    await fetchLessons(course.id);
    setLoadingLessons(null);
  };

  if (activeLesson) return (
    <div className="page-section">
      <button className="back-btn" onClick={()=>setActiveLesson(null)}>← Back to My Courses</button>
      <div className="lesson-viewer">
        <div className="lesson-viewer-header">
          <div className="lesson-order-badge">Lesson {activeLesson.order}</div>
          <h2>{activeLesson.title}</h2>
          <span className="lesson-duration-badge">⏱️ {activeLesson.duration}</span>
        </div>
        <div className="course-context-bar">📚 {activeCourse.course.thumbnail} {activeCourse.course.title}</div>
        <div className="lesson-content-body">{activeLesson.content}</div>
        <div className="lesson-nav">
          <button className="btn-secondary" onClick={()=>setActiveLesson(null)}>← Back</button>
          <span className="lesson-complete-badge">✅ Mark as Read</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-section">
      <div className="section-header">
        <div><h2>My Courses</h2><p className="section-sub">{myEnrollments.length} enrolled courses</p></div>
      </div>
      {myEnrollments.length===0
        ? <div className="empty-state-large"><span>📚</span><h3>No Courses Yet</h3><p>Enroll in courses to get started!</p></div>
        : <div className="my-courses-list">
            {myEnrollments.map(enrollment=>{
              const course = courses.find(c=>c.id===enrollment.course_id);
              if (!course) return null;
              const courseLessons = lessons.filter(l=>l.course_id===course.id).sort((a,b)=>a.order-b.order);
              const hasLoaded = courseLessons.length > 0;
              return (
                <div key={enrollment.id} className="my-course-item">
                  <div className="my-course-header">
                    <div className="my-course-info">
                      <span className="course-thumb-md">{course.thumbnail}</span>
                      <div><h3>{course.title}</h3><span className="muted small">{course.category} · {course.duration} · {course.level}</span></div>
                    </div>
                    <div className="my-course-right">
                      <div className="progress-display">
                        <div className="progress-bar-lg"><div style={{width:`${enrollment.progress}%`,background:'#10b981'}} /></div>
                        <span className="progress-pct">{enrollment.progress}% complete</span>
                      </div>
                      <button className="btn-unenroll" onClick={async()=>{ if(confirm('Unenroll?')) try{await unenroll(course.id)}catch(e){alert(e.message)} }}>Unenroll</button>
                    </div>
                  </div>
                  <div className="lessons-accordion">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <p className="lessons-label">📝 Lessons ({courseLessons.length})</p>
                      {!hasLoaded && <button className="link-btn small" onClick={()=>loadLessons(course)}>{loadingLessons===course.id?'Loading...':'Load Lessons'}</button>}
                    </div>
                    <div className="lessons-mini-list">
                      {courseLessons.map(lesson=>(
                        <button key={lesson.id} className="lesson-mini-item" onClick={()=>openLesson(lesson,course,enrollment)}>
                          <span className="lesson-mini-num">{lesson.order}</span>
                          <span className="lesson-mini-title">{lesson.title}</span>
                          <span className="lesson-mini-dur">{lesson.duration}</span>
                          <span className="lesson-mini-arrow">→</span>
                        </button>
                      ))}
                      {!hasLoaded&&<span className="muted small">Click "Load Lessons" to view lessons</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

export function MyQuizzesPage() {
  const user = useAuthStore(s => s.user);
  const { courses, quizzes, questions, enrollments, attempts, fetchCourseQuizzes, fetchQuizWithQuestions, submitAttempt } = useLmsStore();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allQuizzes, setAllQuizzes] = useState([]);

  const myCourseIds = enrollments.map(e=>e.course_id);

  useEffect(()=>{
    (async()=>{
      const loaded = [];
      for (const cid of myCourseIds) {
        try { const q = await fetchCourseQuizzes(cid); loaded.push(...q); } catch {}
      }
      setAllQuizzes(loaded);
    })();
  }, [enrollments.length]);

  const getPrevAttempt = (quizId) => attempts.find(a=>a.quiz_id===quizId);

  const startQuiz = async (quiz) => {
    setLoading(true);
    const full = await fetchQuizWithQuestions(quiz.id);
    setQuizQuestions(full.questions||[]);
    setActiveQuiz(full);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setLoading(false);
  };

  const handleSubmit = async () => {
    try {
      const res = await submitAttempt(activeQuiz.id, answers);
      setResult(res);
      setSubmitted(true);
    } catch(e) { alert(e.message); }
  };

  if (loading) return <div className="page-section"><div className="empty-state-large"><span className="spinner" style={{width:48,height:48,borderWidth:4}}/><h3>Loading Quiz...</h3></div></div>;

  if (activeQuiz && submitted && result) return (
    <div className="page-section">
      <div className="quiz-result-card">
        <div className={`result-circle ${result.percent>=70?'pass':'fail'}`}>
          <span className="result-pct">{result.percent}%</span>
          <span className="result-label">{result.percent>=70?'Passed! 🎉':'Try Again'}</span>
        </div>
        <h2>{activeQuiz.title}</h2>
        <div className="result-stats">
          <div className="r-stat"><span>{result.score}</span><p>Points</p></div>
          <div className="r-stat"><span>{result.max_score}</span><p>Total</p></div>
          <div className="r-stat"><span>{quizQuestions.filter(q=>answers[q.id]===q.correct).length}</span><p>Correct</p></div>
          <div className="r-stat"><span>{quizQuestions.length}</span><p>Questions</p></div>
        </div>
        <div className="result-review">
          {quizQuestions.map((q,i)=>(
            <div key={q.id} className={`review-item ${answers[q.id]===q.correct?'correct':'wrong'}`}>
              <p className="q-text">Q{i+1}: {q.question}</p>
              <p>Your answer: <strong>{q.options[answers[q.id]]??'Not answered'}</strong></p>
              {answers[q.id]!==q.correct&&<p className="correct-ans">✅ Correct: {q.options[q.correct]}</p>}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={()=>setActiveQuiz(null)}>← Back to Quizzes</button>
      </div>
    </div>
  );

  if (activeQuiz) {
    const answered = Object.keys(answers).length;
    return (
      <div className="page-section">
        <div className="quiz-taking-header">
          <button className="back-btn" onClick={()=>setActiveQuiz(null)}>← Exit</button>
          <div className="quiz-progress-bar"><div style={{width:`${(answered/quizQuestions.length)*100}%`}} /></div>
          <span>{answered}/{quizQuestions.length} answered</span>
        </div>
        <div className="quiz-taking-body">
          <h2>{activeQuiz.title}</h2>
          <p className="muted">⏱️ {activeQuiz.time_limit} min</p>
          {quizQuestions.map((q,i)=>(
            <div key={q.id} className={`question-block ${answers[q.id]!==undefined?'answered':''}`}>
              <div className="q-header">
                <span className="q-num">Q{i+1}</span>
                <p className="q-text-lg">{q.question}</p>
                <span className="q-pts">{q.points} pts</span>
              </div>
              <div className="options-grid">
                {q.options.map((opt,idx)=>(
                  <button key={idx} className={`option-btn ${answers[q.id]===idx?'selected':''}`} onClick={()=>setAnswers({...answers,[q.id]:idx})}>
                    <span className="opt-letter">{String.fromCharCode(65+idx)}</span>{opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="quiz-submit-bar">
            <span className="muted">{answered} of {quizQuestions.length} answered</span>
            <button className="btn-primary btn-lg" onClick={handleSubmit} disabled={answered<quizQuestions.length}>Submit Quiz →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="section-header">
        <div><h2>My Quizzes</h2><p className="section-sub">{allQuizzes.length} quizzes from enrolled courses</p></div>
      </div>
      <div className="quizzes-student-grid">
        {allQuizzes.map(quiz=>{
          const course = courses.find(c=>c.id===quiz.course_id);
          const prev = getPrevAttempt(quiz.id);
          const pct = prev ? Math.round((prev.score/prev.max_score)*100) : null;
          return (
            <div key={quiz.id} className="quiz-student-card">
              <div className="quiz-card-icon">{prev?(pct>=70?'🏆':'📝'):'❓'}</div>
              <div className="quiz-student-info">
                <h3>{quiz.title}</h3>
                <p className="muted small">{course?.thumbnail} {course?.title}</p>
                <div className="quiz-meta-chips">
                  <span>📝 {quiz.questions_count??'?'} questions</span>
                  <span>⏱️ {quiz.time_limit} min</span>
                </div>
                {prev&&<div className={`prev-score ${pct>=70?'pass':'fail'}`}>Previous: {prev.score}/{prev.max_score} ({pct}%)</div>}
              </div>
              <button className={`btn-quiz-start ${prev?'btn-retake':'btn-start'}`} onClick={()=>startQuiz(quiz)}>
                {prev?'🔄 Retake':'▶ Start'}
              </button>
            </div>
          );
        })}
        {allQuizzes.length===0&&<div className="empty-state-large"><span>❓</span><h3>No Quizzes Available</h3><p>Enroll in courses to access quizzes</p></div>}
      </div>
    </div>
  );
}

export function ProgressPage() {
  const user = useAuthStore(s => s.user);
  const { courses, lessons, enrollments, attempts, quizzes } = useLmsStore();
  const myEnrollments = enrollments;
  const myAttempts = attempts.filter(a=>a.student_id===user.id);

  return (
    <div className="page-section">
      <div className="section-header"><div><h2>My Progress</h2><p className="section-sub">Track your learning journey</p></div></div>
      <div className="progress-overview">
        {myEnrollments.map(e=>{
          const course = courses.find(c=>c.id===e.course_id);
          const courseLessons = lessons.filter(l=>l.course_id===e.course_id);
          const courseQuizIds = quizzes.filter(q=>q.course_id===e.course_id).map(q=>q.id);
          const quizAttempts = myAttempts.filter(a=>courseQuizIds.includes(a.quiz_id));
          return (
            <div key={e.id} className="progress-course-card">
              <div className="pc-header">
                <span className="pc-thumb">{course?.thumbnail}</span>
                <div><h3>{course?.title}</h3><span className="muted small">{course?.category} · Enrolled {e.enrolled_at?.split('T')[0]||e.enrolled_at}</span></div>
                <div className="pc-pct-circle"><span>{e.progress}%</span></div>
              </div>
              <div className="pc-progress-bar"><div style={{width:`${e.progress}%`,background:e.progress===100?'#10b981':'#6366f1'}} /></div>
              <div className="pc-stats">
                <div><span>📝</span><p>{courseLessons.length} Lessons</p></div>
                <div><span>❓</span><p>{quizAttempts.length} Quiz Attempts</p></div>
                <div><span>🏆</span><p>{quizAttempts.length?`${Math.round(quizAttempts.reduce((s,a)=>s+(a.score/a.max_score)*100,0)/quizAttempts.length)}% avg`:'No attempts'}</p></div>
              </div>
              {quizAttempts.length>0&&(
                <div className="pc-attempts">
                  <p className="small bold">Quiz Results:</p>
                  {quizAttempts.map(a=>{
                    const quiz = quizzes.find(q=>q.id===a.quiz_id);
                    const pct = Math.round((a.score/a.max_score)*100);
                    return (
                      <div key={a.id} className="attempt-mini">
                        <span>❓ {quiz?.title}</span>
                        <div className="mini-progress"><div style={{width:`${pct}%`,background:pct>=70?'#10b981':'#ef4444'}} /></div>
                        <span className={`pct-badge ${pct>=70?'pass':'fail'}`}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {myEnrollments.length===0&&<div className="empty-state-large"><span>📈</span><h3>No Progress Yet</h3><p>Enroll in courses to start tracking your progress</p></div>}
      </div>
    </div>
  );
}
