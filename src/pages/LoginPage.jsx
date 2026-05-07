import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { login, register, loading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    const result = mode === 'login'
      ? await login(email, password)
      : await register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          role,
        });

    if (result.success) onLogin(result.role);
    else setError(result.error || (mode === 'login' ? 'Invalid email or password.' : 'Could not create account.'));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setPasswordConfirmation('');
  };

  const quickLogin = (quickRole) => {
    const creds = {
      admin: { email: 'admin@lms.com', password: 'admin123' },
      instructor: { email: 'instructor@lms.com', password: 'instructor123' },
      student: { email: 'student@lms.com', password: 'student123' },
    };
    setEmail(creds[quickRole].email);
    setPassword(creds[quickRole].password);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />
        <div className="floating-shapes">
          {['Book', 'Code', 'Cap', 'Data', 'AI', 'Chart', 'Idea', 'Design'].map((label, i) => (
            <span key={label} className="float-icon" style={{ '--delay': `${i * 0.7}s`, '--x': `${10 + i * 11}%` }}>{label}</span>
          ))}
        </div>
      </div>

      <div className="login-container">
        <div className="login-left">
          <div className="brand-logo">
            <span className="logo-icon">LF</span>
            <span className="logo-text">LearnFlow</span>
          </div>
          <h1 className="login-headline">Unlock Your<br /><span className="gradient-text">Learning Journey</span></h1>
          <p className="login-sub">A complete Learning Management System for modern education. Create, learn, and grow together.</p>
          <div className="feature-pills">
            {['100+ Courses', 'Certifications', 'Progress Tracking', 'Community'].map(feature => (
              <span key={feature} className="pill">{feature}</span>
            ))}
          </div>
        </div>

        <div className="login-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Sign In</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Sign Up</button>
          </div>

          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="login-card-sub">{mode === 'login' ? 'Sign in to your account' : 'Join LearnFlow and start learning'}</p>

          {mode === 'login' && (
            <div className="quick-login-btns">
              <p className="quick-label">Quick Access:</p>
              {['admin', 'instructor', 'student'].map(quickRole => (
                <button key={quickRole} type="button" className={`quick-btn quick-${quickRole}`} onClick={() => quickLogin(quickRole)}>
                  {quickRole.charAt(0).toUpperCase() + quickRole.slice(1)}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-alert">{error}</div>}

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">U</span>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Account Type</label>
                  <select value={role} onChange={e => setRole(e.target.value)} required>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">@</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">#</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">#</span>
                  <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} placeholder="Confirm your password" required />
                </div>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : mode === 'login' ? 'Sign In ->' : 'Create Account ->'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="demo-creds">
              <p>Demo Credentials:</p>
              <div className="cred-table">
                <div className="cred-row"><span>Admin</span><span>admin@lms.com / admin123</span></div>
                <div className="cred-row"><span>Instructor</span><span>instructor@lms.com / instructor123</span></div>
                <div className="cred-row"><span>Student</span><span>student@lms.com / student123</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
