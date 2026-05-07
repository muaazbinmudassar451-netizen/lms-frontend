import { create } from 'zustand';
import { api } from '../services/api';

export const useLmsStore = create((set, get) => ({
  courses: [],
  lessons: [],
  quizzes: [],
  questions: [],
  enrollments: [],
  attempts: [],
  loading: false,

  // ── Courses ──────────────────────────────────────────────────────────────
  fetchCourses: async () => {
    set({ loading: true });
    const courses = await api.getCourses();
    set({ courses, loading: false });
  },

  addCourse: async (data) => {
    const course = await api.createCourse(data);
    set(s => ({ courses: [...s.courses, course] }));
  },

  updateCourse: async (id, data) => {
    const updated = await api.updateCourse(id, data);
    set(s => ({ courses: s.courses.map(c => c.id === id ? updated : c) }));
  },

  deleteCourse: async (id) => {
    await api.deleteCourse(id);
    set(s => ({ courses: s.courses.filter(c => c.id !== id) }));
  },

  // ── Lessons ──────────────────────────────────────────────────────────────
  fetchLessons: async (courseId) => {
    const lessons = await api.getLessons(courseId);
    set(s => ({
      lessons: [...s.lessons.filter(l => l.course_id !== courseId), ...lessons]
    }));
    return lessons;
  },

  addLesson: async (courseId, data) => {
    const lesson = await api.createLesson(courseId, data);
    set(s => ({ lessons: [...s.lessons, lesson] }));
  },

  updateLesson: async (courseId, id, data) => {
    const updated = await api.updateLesson(courseId, id, data);
    set(s => ({ lessons: s.lessons.map(l => l.id === id ? updated : l) }));
  },

  deleteLesson: async (courseId, id) => {
    await api.deleteLesson(courseId, id);
    set(s => ({ lessons: s.lessons.filter(l => l.id !== id) }));
  },

  // ── Enrollments ───────────────────────────────────────────────────────────
  fetchMyEnrollments: async () => {
    const enrollments = await api.getMyEnrollments();
    set({ enrollments });
  },

  fetchAllEnrollments: async () => {
    const enrollments = await api.getAllEnrollments();
    set({ enrollments });
  },

  enroll: async (courseId) => {
    const enrollment = await api.enroll(courseId);
    set(s => ({ enrollments: [...s.enrollments, enrollment] }));
    return true;
  },

  unenroll: async (courseId) => {
    await api.unenroll(courseId);
    set(s => ({ enrollments: s.enrollments.filter(e => e.course_id !== courseId) }));
  },

  updateProgress: async (courseId, progress) => {
    const updated = await api.updateProgress(courseId, progress);
    set(s => ({
      enrollments: s.enrollments.map(e => e.course_id === courseId ? { ...e, progress } : e)
    }));
  },

  // ── Quizzes ───────────────────────────────────────────────────────────────
  fetchCourseQuizzes: async (courseId) => {
    const quizzes = await api.getCourseQuizzes(courseId);
    set(s => ({
      quizzes: [...s.quizzes.filter(q => q.course_id !== courseId), ...quizzes]
    }));
    return quizzes;
  },

  fetchQuizWithQuestions: async (quizId) => {
    const quiz = await api.getQuiz(quizId);
    set(s => ({
      quizzes: s.quizzes.map(q => q.id === quizId ? quiz : q),
      questions: [...s.questions.filter(q => q.quiz_id !== quizId), ...(quiz.questions || [])]
    }));
    return quiz;
  },

  addQuiz: async (data) => {
    const quiz = await api.createQuiz(data);
    set(s => ({ quizzes: [...s.quizzes, quiz] }));
  },

  updateQuiz: async (id, data) => {
    const updated = await api.updateQuiz(id, data);
    set(s => ({ quizzes: s.quizzes.map(q => q.id === id ? updated : q) }));
  },

  deleteQuiz: async (id) => {
    await api.deleteQuiz(id);
    set(s => ({ quizzes: s.quizzes.filter(q => q.id !== id) }));
  },

  addQuestion: async (quizId, data) => {
    const question = await api.addQuestion(quizId, data);
    set(s => ({ questions: [...s.questions, question] }));
  },

  deleteQuestion: async (id) => {
    await api.deleteQuestion(id);
    set(s => ({ questions: s.questions.filter(q => q.id !== id) }));
  },

  // ── Attempts ──────────────────────────────────────────────────────────────
  fetchMyAttempts: async () => {
    const attempts = await api.getMyAttempts();
    set({ attempts });
  },

  submitAttempt: async (quizId, answers) => {
    const result = await api.submitQuiz(quizId, answers);
    set(s => ({ attempts: [...s.attempts, result.attempt] }));
    return result;
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  getEnrollment: (courseId) =>
    get().enrollments.find(e => e.course_id === courseId),

  getStudentAttempt: (quizId) =>
    get().attempts.find(a => a.quiz_id === quizId),
}));
