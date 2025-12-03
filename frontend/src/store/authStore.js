import { create } from 'zustand';
import { authAPI } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Ініціалізація - перевірка токена при завантаженні
  initialize: async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        set({ user: response.data, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  // Логін
  login: async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Отримуємо дані користувача
      const userResponse = await authAPI.getMe();
      set({ user: userResponse.data, isAuthenticated: true });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Помилка входу',
      };
    }
  },

  // Реєстрація
  register: async (data) => {
    try {
      await authAPI.register(data);
      // Після реєстрації автоматично логінимо
      return await get().login(data.email, data.password);
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Помилка реєстрації',
      };
    }
  },

  // Вихід
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  // Оновити дані користувача в сторі
  updateUser: (userData) => {
    set({ user: userData });
  },

  // Оновити профіль
  updateProfile: async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      set({ user: response.data });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Помилка оновлення профілю',
      };
    }
  },
}));

export default useAuthStore;
