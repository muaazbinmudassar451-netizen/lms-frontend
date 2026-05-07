import { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useLmsStore } from './store/lmsStore';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import CoursesPage from './pages/shared/CoursesPage';
import LessonsPage from './pages/instructor/LessonsPage';
import QuizzesPage from './pages/instructor/QuizzesPage';
import { InstructorDashboard, StudentsPage } from './pages/instructor/InstructorPages';
import { StudentDashboard, BrowseCoursesPage, MyCoursesPage, MyQuizzesPage, ProgressPage } from './pages/student/StudentPages';
import { AdminEnrollmentsPage, ReportsPage } from './pages/admin/AdminPages';
import './App.css';

function AppContent() {
  const user = useAuthStore(s => s.user);
  const init = useAuthStore(s => s.init);
  const fetchCourses = useLmsStore(s => s.fetchCourses);
  const fetchMyEnrollments = useLmsStore(s => s.fetchMyEnrollments);
  const fetchMyAttempts = useLmsStore(s => s.fetchMyAttempts);
  const [currentView, setCurrentView] = useState('dashboard');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    init().finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    if (user) {
      fetchCourses();
      if (user.role === 'student') {
        fetchMyEnrollments();
        fetchMyAttempts();
      }
    }
  }, [user]);

  if (initializing) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f1117', color:'#e2e8f0', fontSize:'1.2rem', gap:'12px' }}>
      <span style={{ display:'inline-block', width:32, height:32, border:'3px solid #2a3347', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      Loading LearnFlow...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return <LoginPage onLogin={() => setCurrentView('dashboard')} />;

  const renderView = () => {
    if (user.role === 'admin') {
      switch (currentView) {
        case 'dashboard':   return <AdminDashboard setView={setCurrentView} />;
        case 'users':       return <UsersPage />;
        case 'courses':     return <CoursesPage isAdmin />;
        case 'enrollments': return <AdminEnrollmentsPage />;
        case 'reports':     return <ReportsPage />;
        default:            return <AdminDashboard setView={setCurrentView} />;
      }
    }
    if (user.role === 'instructor') {
      switch (currentView) {
        case 'dashboard': return <InstructorDashboard setView={setCurrentView} />;
        case 'courses':   return <CoursesPage isAdmin={false} />;
        case 'lessons':   return <LessonsPage />;
        case 'quizzes':   return <QuizzesPage />;
        case 'students':  return <StudentsPage />;
        default:          return <InstructorDashboard setView={setCurrentView} />;
      }
    }
    if (user.role === 'student') {
      switch (currentView) {
        case 'dashboard':  return <StudentDashboard setView={setCurrentView} />;
        case 'browse':     return <BrowseCoursesPage />;
        case 'my-courses': return <MyCoursesPage />;
        case 'my-quizzes': return <MyQuizzesPage />;
        case 'progress':   return <ProgressPage />;
        default:           return <StudentDashboard setView={setCurrentView} />;
      }
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default function App() { return <AppContent />; }
