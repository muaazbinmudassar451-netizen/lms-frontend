import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLmsStore } from '../../store/lmsStore';

export default function LessonsPage() {
  const user = useAuthStore(s => s.user);
  const { courses, lessons, fetchLessons, addLesson, updateLesson, deleteLesson } = useLmsStore();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [viewLesson, setViewLesson] = useState(null);
  const [form, setForm] = useState({ title:'', content:'', order:1, duration:'30 min' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const myCourses = courses.filter(c => c.instructor_id === user.id);
  const courseLessons = selectedCourse
    ? lessons.filter(l => l.course_id === selectedCourse.id).sort((a,b)=>a.order-b.order)
    : [];

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    await fetchLessons(course.id);
  };

  const openAdd = () => {
    const maxOrder = Math.max(0, ...courseLessons.map(l=>l.order));
    setForm({ title:'', content:'', order:maxOrder+1, duration:'30 min' });
    setEditLesson(null); setError(''); setShowModal(true);
  };
  const openEdit = (l) => { setForm({ title:l.title, content:l.content, order:l.order, duration:l.duration }); setEditLesson(l); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editLesson) await updateLesson(selectedCourse.id, editLesson.id, form);
      else await addLesson(selectedCourse.id, form);
      setShowModal(false);
    } catch(e) { setError(e.message); }
    setSaving(false);
  };

  if (viewLesson) return (
    <div className="page-section">
      <button className="back-btn" onClick={()=>setViewLesson(null)}>← Back to Lessons</button>
      <div className="lesson-viewer">
        <div className="lesson-viewer-header">
          <div className="lesson-order-badge">Lesson {viewLesson.order}</div>
          <h2>{viewLesson.title}</h2>
          <span className="lesson-duration-badge">⏱️ {viewLesson.duration}</span>
        </div>
        <div className="lesson-content-body">{viewLesson.content}</div>
      </div>
    </div>
  );

  return (
    <div className="page-section">
      <div className="section-header">
        <div><h2>Lesson Management</h2><p className="section-sub">Manage lessons for your courses</p></div>
      </div>

      <div className="course-selector">
        <p className="selector-label">Select a course:</p>
        <div className="course-chips">
          {myCourses.map(c=>(
            <button key={c.id} className={`course-chip ${selectedCourse?.id===c.id?'active':''}`} onClick={()=>selectCourse(c)}>
              {c.thumbnail} {c.title}
              <span className="chip-count">{lessons.filter(l=>l.course_id===c.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedCourse ? (
        <>
          <div className="section-subheader">
            <div><h3>{selectedCourse.thumbnail} {selectedCourse.title}</h3><p className="section-sub">{courseLessons.length} lessons</p></div>
            <button className="btn-primary" onClick={openAdd}>+ Add Lesson</button>
          </div>
          <div className="lessons-list">
            {courseLessons.map(lesson=>(
              <div key={lesson.id} className="lesson-item">
                <div className="lesson-order">{lesson.order}</div>
                <div className="lesson-info">
                  <h4>{lesson.title}</h4>
                  <p className="lesson-preview">{lesson.content.slice(0,100)}...</p>
                  <span className="lesson-duration">⏱️ {lesson.duration}</span>
                </div>
                <div className="lesson-actions">
                  <button className="btn-view" onClick={()=>setViewLesson(lesson)}>👁️ View</button>
                  <button className="btn-edit" onClick={()=>openEdit(lesson)}>✏️ Edit</button>
                  <button className="btn-delete" onClick={async()=>{ if(confirm('Delete?')) try{await deleteLesson(selectedCourse.id,lesson.id)}catch(e){alert(e.message)} }}>🗑️</button>
                </div>
              </div>
            ))}
            {courseLessons.length===0&&<div className="empty-lessons"><span>📝</span><p>No lessons yet.</p><button className="btn-primary" onClick={openAdd}>+ Add First Lesson</button></div>}
          </div>
        </>
      ) : (
        <div className="empty-state-large"><span>📚</span><h3>Select a Course</h3><p>Choose a course above to manage its lessons</p></div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal modal-wide" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>{editLesson?'Edit Lesson':'Add Lesson'}</h3><button className="modal-close" onClick={()=>setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              {error&&<div className="error-alert">⚠️ {error}</div>}
              <div className="form-row">
                <div className="form-group" style={{flex:3}}><label>Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></div>
                <div className="form-group"><label>Order</label><input type="number" min="1" value={form.order} onChange={e=>setForm({...form,order:parseInt(e.target.value)})} /></div>
                <div className="form-group"><label>Duration</label><input value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Content</label><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={6} required /></div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving?<span className="spinner"/>:editLesson?'Update':'Add'} Lesson</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
