import api from './axios';

export const authAPI = {
  // Реєстрація
  register: (data) => api.post('/users/register/', data),

  // Логін
  login: (credentials) => api.post('/auth/login/', credentials),

  // Оновлення токена
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),

  // Отримати поточного користувача
  getMe: () => api.get('/users/me/'),

  // Оновити профіль
  updateProfile: (data) => api.patch('/users/me/', data),
};

export default authAPI;
