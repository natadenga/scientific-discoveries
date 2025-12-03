import api from './axios';

export const ideasAPI = {
  // Список ідей
  getList: (params = {}) => api.get('/ideas/', { params }),

  // Отримати ідею за slug
  getBySlug: (slug) => api.get(`/ideas/${slug}/`),

  // Створити ідею
  create: (data) => api.post('/ideas/', data),

  // Оновити ідею
  update: (slug, data) => api.patch(`/ideas/${slug}/`, data),

  // Видалити ідею
  delete: (slug) => api.delete(`/ideas/${slug}/`),

  // Лайкнути
  like: (slug) => api.post(`/ideas/${slug}/like/`),

  // Отримати коментарі
  getComments: (slug) => api.get(`/ideas/${slug}/comments/`),

  // Додати коментар
  addComment: (slug, content) => api.post(`/ideas/${slug}/comments/`, { content }),

  // Видалити коментар
  deleteComment: (commentId) => api.delete(`/ideas/comments/${commentId}/`),

  // Мої ідеї
  getMy: () => api.get('/ideas/my/'),
};

export const fieldsAPI = {
  // Список галузей науки
  getList: () => api.get('/ideas/fields/'),

  // Отримати галузь за slug
  getBySlug: (slug) => api.get(`/ideas/fields/${slug}/`),
};

export default { ideasAPI, fieldsAPI };
