import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function UsersPage() {
  const { users, fetchUsers, addUser, updateUser, deleteUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setForm({ name:'', email:'', password:'', role:'student' }); setEditUser(null); setError(''); setShowModal(true); };
  const openEdit = (u) => { setForm({ name:u.name, email:u.email, password:'', role:u.role }); setEditUser(u); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editUser) await updateUser(editUser.id, form);
      else await addUser(form);
      setShowModal(false);
    } catch(e) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await deleteUser(id); } catch(e) { alert(e.message); }
  };

  const roleColors = { admin:'#ef4444', instructor:'#8b5cf6', student:'#10b981' };

  return (
    <div className="page-section">
      <div className="section-header">
        <div><h2>User Management</h2><p className="section-sub">{users.length} total users</p></div>
        <button className="btn-primary" onClick={openAdd}>+ Add User</button>
      </div>

      <div className="filters-bar">
        <input className="search-input" placeholder="🔍 Search users..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div className="filter-tabs">
          {['all','admin','instructor','student'].map(r => (
            <button key={r} className={`filter-tab ${roleFilter===r?'active':''}`} onClick={()=>setRoleFilter(r)}>
              {r==='all'?'All':r.charAt(0).toUpperCase()+r.slice(1)}
              <span className="filter-count">{r==='all'?users.length:users.filter(u=>u.role===r).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="users-table">
        <div className="table-header"><span>User</span><span>Email</span><span>Role</span><span>Actions</span></div>
        {filtered.map(u => (
          <div key={u.id} className="table-row">
            <span className="user-cell-lg">
              <div className="user-avatar-sm" style={{background:roleColors[u.role]}}>{u.avatar||u.name[0]}</div>
              <div><p className="user-name-text">{u.name}</p><p className="user-id-text">ID: #{u.id}</p></div>
            </span>
            <span className="muted">{u.email}</span>
            <span><span className="role-badge-lg" style={{background:roleColors[u.role]+'22',color:roleColors[u.role]}}>{u.role==='admin'?'🛡️':u.role==='instructor'?'👨‍🏫':'👨‍🎓'} {u.role}</span></span>
            <span className="actions-cell">
              <button className="btn-edit" onClick={()=>openEdit(u)}>✏️ Edit</button>
              <button className="btn-delete" onClick={()=>handleDelete(u.id)}>🗑️ Delete</button>
            </span>
          </div>
        ))}
        {filtered.length===0 && <div className="empty-state">No users found</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editUser?'Edit User':'Add New User'}</h3>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="error-alert">⚠️ {error}</div>}
              <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
              <div className="form-group"><label>Password {editUser&&'(leave blank to keep)'}</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required={!editUser} /></div>
              <div className="form-group"><label>Role</label>
                <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  <option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving?<span className="spinner"/>:editUser?'Update':'Create'} User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
