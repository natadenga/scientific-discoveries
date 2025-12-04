import api from './axios';

export const usersAPI = {
  // Список користувачів
  getList: (params = {}) => api.get('/users/', { params }),

  // Отримати користувача за id
  getById: (id) => api.get(`/users/${id}/`),

  // Отримати контент користувача
  getContents: (id) => api.get(`/users/${id}/contents/`),

  // Підписатися / відписатися
  follow: (id) => api.post(`/users/${id}/follow/`),

  // Отримати підписників
  getFollowers: (id) => api.get(`/users/${id}/followers/`),

  // Отримати підписки
  getFollowing: (id) => api.get(`/users/${id}/following/`),

  // Оновити профіль поточного користувача
  updateProfile: (data) => api.patch('/users/me/', data),
};

// API для закладів освіти
export const institutionsAPI = {
  // Пошук закладів освіти
  search: (query) => api.get('/institutions/', { params: { search: query } }),

  // Додати новий заклад
  create: (name) => api.post('/institutions/', { name }),
};

export default usersAPI;
