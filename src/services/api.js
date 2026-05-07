const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getToken() {
  return localStorage.getItem('lms_token');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat().join(', ')
      : null;
    const message = validationMessage || data?.message || `Error ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  get:    (path)          => request('GET',    path),
  post:   (path, body)    => request('POST',   path, body),
  put:    (path, body)    => request('PUT',    path, body),
  patch:  (path, body)    => request('PATCH',  path, body),
  delete: (path)          => request('DELETE', path),

  // Auth
  register: (data)            => request('POST', '/register', data),
  login:    (email, password) => request('POST', '/login',  { email, password }),
  logout: ()                => request('POST', '/logout'),
  me:     ()                => request('GET',  '/me'),

  // Users (admin)
  getUsers:    ()           => request('GET',    '/users'),
  createUser:  (data)       => request('POST',   '/users',       data),
  updateUser:  (id, data)   => request('PUT',    `/users/${id}`, data),
  deleteUser:  (id)         => request('DELETE', `/users/${id}`),

  // Courses
  getCourses:      ()           => request('GET',    '/courses'),
  getCourse:       (id)         => request('GET',    `/courses/${id}`),
  createCourse:    (data)       => request('POST',   '/courses',       data),
  updateCourse:    (id, data)   => request('PUT',    `/courses/${id}`, data),
  deleteCourse:    (id)         => request('DELETE', `/courses/${id}`),

  // Lessons
  getLessons:   (courseId)           => request('GET',    `/courses/${courseId}/lessons`),
  createLesson: (courseId, data)     => request('POST',   `/courses/${courseId}/lessons`,         data),
  updateLesson: (courseId, id, data) => request('PUT',    `/courses/${courseId}/lessons/${id}`,   data),
  deleteLesson: (courseId, id)       => request('DELETE', `/courses/${courseId}/lessons/${id}`),

  // Enrollments
  getMyEnrollments: ()           => request('GET',    '/my-enrollments'),
  getAllEnrollments: ()          => request('GET',    '/enrollments'),
  enroll:           (courseId)   => request('POST',   `/courses/${courseId}/enroll`),
  unenroll:         (courseId)   => request('DELETE', `/courses/${courseId}/unenroll`),
  updateProgress:   (courseId, progress) => request('PATCH', `/courses/${courseId}/progress`, { progress }),

  // Quizzes
  getCourseQuizzes: (courseId)       => request('GET',    `/courses/${courseId}/quizzes`),
  getQuiz:          (id)             => request('GET',    `/quizzes/${id}`),
  createQuiz:       (data)           => request('POST',   '/quizzes',        data),
  updateQuiz:       (id, data)       => request('PUT',    `/quizzes/${id}`,  data),
  deleteQuiz:       (id)             => request('DELETE', `/quizzes/${id}`),
  addQuestion:      (quizId, data)   => request('POST',   `/quizzes/${quizId}/questions`, data),
  deleteQuestion:   (questionId)     => request('DELETE', `/questions/${questionId}`),

  // Attempts
  getMyAttempts:  ()                 => request('GET',  '/my-attempts'),
  submitQuiz:     (quizId, answers)  => request('POST', `/quizzes/${quizId}/submit`, { answers }),
  getQuizAttempts:(quizId)           => request('GET',  `/quizzes/${quizId}/attempts`),
};
