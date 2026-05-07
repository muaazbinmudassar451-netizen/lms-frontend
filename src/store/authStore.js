import { create } from 'zustand';
import { api } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  users: [],
  loading: false,
  error: null,

  init: async () => {
    const token = localStorage.getItem('lms_token');
    if (!token) return;
    try {
      const user = await api.me();
      set({ user });
    } catch {
      localStorage.removeItem('lms_token');
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await api.login(email, password);
      localStorage.setItem('lms_token', token);
      set({ user, loading: false });
      return { success: true, role: user.role };
    } catch (e) {
      set({ error: e.message, loading: false });
      return { success: false, error: e.message };
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await api.register(data);
      localStorage.setItem('lms_token', token);
      set({ user, loading: false });
      return { success: true, role: user.role };
    } catch (e) {
      set({ error: e.message, loading: false });
      return { success: false, error: e.message };
    }
  },

  logout: async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem('lms_token');
    set({ user: null, users: [] });
  },

  fetchUsers: async () => {
    const users = await api.getUsers();
    set({ users });
  },

  addUser: async (data) => {
    const user = await api.createUser(data);
    set(s => ({ users: [...s.users, user] }));
  },

  updateUser: async (id, data) => {
    const updated = await api.updateUser(id, data);
    set(s => ({ users: s.users.map(u => u.id === id ? updated : u) }));
  },

  deleteUser: async (id) => {
    await api.deleteUser(id);
    set(s => ({ users: s.users.filter(u => u.id !== id) }));
  },
}));
