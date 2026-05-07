import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLmsStore } from '../../store/lmsStore';

export default function QuizzesPage() {
  const user = useAuthStore(s => s.user);
  const { courses, quizzes, questions, attempts, fetchCourses, fetchCourseQuizzes, fetchQuizWithQuestions, addQuiz, updateQuiz, deleteQuiz, addQuestion, deleteQuestion } = useLmsStore();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title:'', description:'', course_id:'', time_limit:15 });
  const [qForm, setQForm] = useState({ question:'', options:['','','',''], correct:0, points:10 });
  const [saving, setSaving] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState('');

  const myCourses = courses.filter(c => c.instructor_id === user.id);
  const myCourseIds = myCourses.map(c => c.id);
  const myQuizzes = quizzes.filter(q => myCourseIds.includes(q.course_id));

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (myCourses.length > 0) {
      myCourses.forEach(c => fetchCourseQuizzes(c.id).catch(()=>{}));
    }
  }, [courses.length]);

  const selectQuiz = async (quiz) => {
    setLoadingQuiz(true);
    const full = await fetchQuizWithQuestions(quiz.id);
    setSelectedQuiz(full);
    setLoadingQuiz(false);
  };

  const openAddQuiz = () => {
    setQuizForm({ title:'', description:'', course_id:myCourses[0]?.id||'', time_limit:15 });
    setEditQuiz(null); setError(''); setShowQuizModal(true);
  };
  const openEditQuiz = (q) => {
    setQuizForm({ title:q.title, description:q.description||'', course_id:q.course_id, time_limit:q.time_limit });
    setEditQuiz(q); setError(''); setShowQuizModal(true);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = { ...quizForm, course_id:parseInt(quizForm.course_id) };
      if (editQuiz) await updateQuiz(editQuiz.id, data);
      else await addQuiz(data);
      setShowQuizModal(false);
    } catch(e) { setError(e.message); }
    setSaving(false);
  };

  const handleQSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await addQuestion(selectedQuiz.id, qForm);
      const updated = await fetchQuizWithQuestions(selectedQuiz.id);
      setSelectedQuiz(updated);
      setQForm({ question:'', options:['','','',''], correct:0, points:10 });
      setShowQModal(false);
    } catch(e) { setError(e.message); }
    setSaving(false);
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await deleteQuestion(id);
      const updated = await fetchQuizWithQuestions(selectedQuiz.id);
      setSelectedQuiz(updated);
    } catch(e) { alert(e.message); }
  };

  const quizQuestions = selectedQuiz?.questions || questions.filter(q=>q.quiz_id===selectedQuiz?.id);
  const quizAttempts  = selectedQuiz ? attempts.filter(a=>a.quiz_id===selectedQuiz.id) : [];

  return (
    <div className="page-section">
      <div className="section-header">
        <div><h2>Quiz Management</h2><p className="section-sub">Create and manage quizzes for your courses</p></div>
        <button className="btn-primary" onClick={openAddQuiz} disabled={myCourses.length===0}>+ Create Quiz</button>
      </div>

      <div className="two-col-layout">
        {/* Quiz List */}
        <div className="quiz-list-panel">
          <h3 className="panel-title">My Quizzes ({myQuizzes.length})</h3>
          {myQuizzes.map(q=>{
            const course = myCourses.find(c=>c.id===q.course_id);
            return (
              <div key={q.id} className={`quiz-card ${selectedQuiz?.id===q.id?'selected':''}`} onClick={()=>selectQuiz(q)}>
                <div className="quiz-card-header">
                  <h4>❓ {q.title}</h4>
                  <div className="quiz-card-actions" onClick={e=>e.stopPropagation()}>
                    <button className="btn-icon" onClick={()=>openEditQuiz(q)}>✏️</button>
                    <button className="btn-icon" onClick={async()=>{ if(confirm('Delete quiz?')){try{await deleteQuiz(q.id);if(selectedQuiz?.id===q.id)setSelectedQuiz(null);}catch(e){alert(e.message)}} }}>🗑️</button>
                  </div>
                </div>
                <p className="muted small">{course?.thumbnail} {course?.title}</p>
                <div className="quiz-meta-chips">
                  <span>📝 {q.questions_count??'?'} questions</span>
                  <span>⏱️ {q.time_limit} min</span>
                </div>
              </div>
            );
          })}
          {myQuizzes.length===0&&<div className="empty-state">No quizzes yet. Create one!</div>}
        </div>

        {/* Quiz Detail */}
        <div className="quiz-detail-panel">
          {loadingQuiz ? (
            <div className="empty-state-large"><span className="spinner" style={{width:36,height:36,borderWidth:3}}/><p>Loading quiz...</p></div>
          ) : selectedQuiz ? (
            <>
              <div className="section-subheader">
                <div><h3>❓ {selectedQuiz.title}</h3><p className="muted">{selectedQuiz.description}</p></div>
                <button className="btn-primary" onClick={()=>{setError('');setShowQModal(true)}}>+ Add Question</button>
              </div>

              <div className="questions-list">
                {quizQuestions.map((q,i)=>(
                  <div key={q.id} className="question-item">
                    <div className="q-number">Q{i+1}</div>
                    <div className="q-content">
                      <p className="q-text">{q.question}</p>
                      <div className="q-options">
                        {q.options.map((opt,idx)=>(
                          <span key={idx} className={`q-option ${idx===q.correct?'correct':''}`}>
                            {idx===q.correct?'✅':'○'} {opt}
                          </span>
                        ))}
                      </div>
                      <span className="q-points">{q.points} pts</span>
                    </div>
                    <button className="btn-icon-red" onClick={()=>handleDeleteQuestion(q.id)}>🗑️</button>
                  </div>
                ))}
                {quizQuestions.length===0&&<div className="empty-state">No questions yet. Add your first question!</div>}
              </div>

              {quizAttempts.length>0&&(
                <div className="attempts-section">
                  <h4>📊 Quiz Attempts ({quizAttempts.length})</h4>
                  {quizAttempts.map(a=>{
                    const pct=Math.round((a.score/a.max_score)*100);
                    return (
                      <div key={a.id} className="attempt-row">
                        <span>Student #{a.student_id}</span>
                        <span>{a.score}/{a.max_score} pts</span>
                        <div className="mini-progress"><div style={{width:`${pct}%`,background:pct>=70?'#10b981':'#ef4444'}} /></div>
                        <span className={`pct-badge ${pct>=70?'pass':'fail'}`}>{pct}%</span>
                        <span className="muted small">{a.completed_at?.split('T')[0]||a.completed_at}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state-large"><span>❓</span><h3>Select a Quiz</h3><p>Choose a quiz to manage its questions</p></div>
          )}
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuizModal&&(
        <div className="modal-overlay" onClick={()=>setShowQuizModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>{editQuiz?'Edit Quiz':'Create Quiz'}</h3><button className="modal-close" onClick={()=>setShowQuizModal(false)}>✕</button></div>
            <form onSubmit={handleQuizSubmit} className="modal-form">
              {error&&<div className="error-alert">⚠️ {error}</div>}
              <div className="form-group"><label>Quiz Title</label><input value={quizForm.title} onChange={e=>setQuizForm({...quizForm,title:e.target.value})} required /></div>
              <div className="form-group"><label>Description</label><textarea value={quizForm.description} onChange={e=>setQuizForm({...quizForm,description:e.target.value})} rows={2} /></div>
              <div className="form-row">
                <div className="form-group"><label>Course</label>
                  <select value={quizForm.course_id} onChange={e=>setQuizForm({...quizForm,course_id:e.target.value})}>
                    {myCourses.map(c=><option key={c.id} value={c.id}>{c.thumbnail} {c.title}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Time Limit (min)</label><input type="number" min="1" value={quizForm.time_limit} onChange={e=>setQuizForm({...quizForm,time_limit:parseInt(e.target.value)})} /></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={()=>setShowQuizModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving?<span className="spinner"/>:editQuiz?'Update':'Create'} Quiz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQModal&&(
        <div className="modal-overlay" onClick={()=>setShowQModal(false)}>
          <div className="modal modal-wide" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Add Question</h3><button className="modal-close" onClick={()=>setShowQModal(false)}>✕</button></div>
            <form onSubmit={handleQSubmit} className="modal-form">
              {error&&<div className="error-alert">⚠️ {error}</div>}
              <div className="form-group"><label>Question</label><textarea value={qForm.question} onChange={e=>setQForm({...qForm,question:e.target.value})} rows={2} required /></div>
              <div className="form-group">
                <label>Options (select the correct answer)</label>
                {qForm.options.map((opt,idx)=>(
                  <div key={idx} className="option-input-row">
                    <input type="radio" name="correct" checked={qForm.correct===idx} onChange={()=>setQForm({...qForm,correct:idx})} />
                    <span className={`option-label ${qForm.correct===idx?'correct-label':''}`}>{String.fromCharCode(65+idx)}</span>
                    <input value={opt} onChange={e=>{ const opts=[...qForm.options]; opts[idx]=e.target.value; setQForm({...qForm,options:opts}); }} placeholder={`Option ${String.fromCharCode(65+idx)}`} required />
                  </div>
                ))}
              </div>
              <div className="form-group"><label>Points</label><input type="number" min="1" value={qForm.points} onChange={e=>setQForm({...qForm,points:parseInt(e.target.value)})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={()=>setShowQModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving?<span className="spinner"/>:'Add Question'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
