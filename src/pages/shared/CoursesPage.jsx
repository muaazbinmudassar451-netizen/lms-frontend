import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLmsStore } from '../../store/lmsStore';

const CATEGORIES = ['Web Development','Programming','Data Science','Design','Backend','Mobile','DevOps'];
const LEVELS = ['Beginner','Intermediate','Advanced'];
const EMOJIS = ['⚛️','🐍','🤖','🎨','🗄️','📱','☁️','🔐','📊','🎯'];

export default function CoursesPage({ isAdmin = false }) {
  const user = useAuthStore(s => s.user);
  const { courses, fetchCourses, addCourse, updateCourse, deleteCourse, enrollments } = useLmsStore();
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title:'', description:'', category:'Web Development', status:'draft', thumbnail:'⚛️', duration:'4 weeks', level:'Beginner' });

  useEffect(() => { fetchCourses(); }, []);

  const myCourses = isAdmin ? courses : courses.filter(c => c.instructor_id === user.id);
  const filtered = myCourses.filter(c =>
    (catFilter==='all'||c.category===catFilter) && c.title.toLowerCase().includes(search.toLowerCase())
  );

  const getEnrollCount = (id) => (c => c ? (c.enrollments_count || enrollments.filter(e=>e.course_id===id).length) : 0)(courses.find(c=>c.id===id));

  const openAdd = () => { setForm({ title:'', description:'', category:'Web Development', status:'draft', thumbnail:'⚛️', duration:'4 weeks', level:'Beginner' }); setEditCourse(null); setError(''); setShowModal(true); };
  const openEdit = (c) => { setForm({ title:c.title, description:c.description, category:c.category, status:c.status, thumbnail:c.thumbnail, duration:c.duration, level:c.level }); setEditCourse(c); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editCourse) await updateCourse(editCourse.id, form);
      else await addCourse(form);
      setShowModal(false);
    } catch(e) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try { await deleteCourse(id); } catch(e) { alert(e.message); }
  };

  return (
    <div className="page-section">
      <div className="section-header">
        <div><h2>{isAdmin?'All Courses':'My Courses'}</h2><p className="section-sub">{filtered.length} courses</p></div>
        {!isAdmin && <button className="btn-primary" onClick={openAdd}>+ Create Course</button>}
      </div>

      <div className="filters-bar">
        <input className="search-input" placeholder="🔍 Search courses..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div className="filter-tabs">
          <button className={`filter-tab ${catFilter==='all'?'active':''}`} onClick={()=>setCatFilter('all')}>All</button>
          {[...new Set(myCourses.map(c=>c.category))].map(cat=>(
            <button key={cat} className={`filter-tab ${catFilter===cat?'active':''}`} onClick={()=>setCatFilter(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="courses-grid">
        {filtered.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-thumbnail">{course.thumbnail}</div>
            <div className="course-card-body">
              <div className="course-meta-top">
                <span className={`status-badge status-${course.status}`}>{course.status}</span>
                <span className="level-badge">{course.level}</span>
              </div>
              <h3 className="course-title">{course.title}</h3>
              <p className="course-desc">{course.description}</p>
              <div className="course-tags">
                <span className="course-tag">📁 {course.category}</span>
                <span className="course-tag">⏱️ {course.duration}</span>
                <span className="course-tag">👥 {course.enrollments_count ?? 0} enrolled</span>
              </div>
              {isAdmin && course.instructor && (
                <div className="instructor-row">
                  <span className="mini-avatar" style={{background:'#8b5cf6'}}>{course.instructor.avatar||course.instructor.name[0]}</span>
                  <span className="muted">{course.instructor.name}</span>
                </div>
              )}
            </div>
            {!isAdmin && (
              <div className="course-card-actions">
                <button className="btn-edit" onClick={()=>openEdit(course)}>✏️ Edit</button>
                <button className="btn-delete" onClick={()=>handleDelete(course.id)}>🗑️ Delete</button>
              </div>
            )}
          </div>
        ))}
        {!isAdmin && (
          <div className="course-add-card" onClick={openAdd}>
            <span className="add-icon">+</span><p>Create New Course</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal modal-wide" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editCourse?'Edit Course':'Create New Course'}</h3>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="error-alert">⚠️ {error}</div>}
              <div className="emoji-picker">
                <label>Course Icon</label>
                <div className="emoji-grid">
                  {EMOJIS.map(e=><button key={e} type="button" className={`emoji-btn ${form.thumbnail===e?'selected':''}`} onClick={()=>setForm({...form,thumbnail:e})}>{e}</button>)}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Course Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></div>
                <div className="form-group"><label>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Level</label><select value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
                <div className="form-group"><label>Duration</label><input value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} /></div>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="draft">Draft</option><option value="published">Published</option></select></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving?<span className="spinner"/>:editCourse?'Update':'Create'} Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
