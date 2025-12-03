import api from './axios';

export const usersAPI = {
  // Список користувачів
  getList: (params = {}) => api.get('/users/', { params }),

  // Отримати користувача за id
  getById: (id) => api.get(`/users/${id}/`),

  // Підписатися / відписатися
  follow: (id) => api.post(`/users/${id}/follow/`),

  // Отримати підписників
  getFollowers: (id) => api.get(`/users/${id}/followers/`),

  // Отримати підписки
  getFollowing: (id) => api.get(`/users/${id}/following/`),
};

export default usersAPI;
