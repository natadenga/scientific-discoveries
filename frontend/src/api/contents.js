import api from './axios';

export const contentsAPI = {
  // Список контенту
  getList: (params = {}) => api.get('/contents/', { params }),

  // Отримати контент за slug
  getBySlug: (slug) => api.get(`/contents/${slug}/`),

  // Створити контент
  create: (data) => api.post('/contents/', data),

  // Оновити контент
  update: (slug, data) => api.patch(`/contents/${slug}/`, data),

  // Видалити контент
  delete: (slug) => api.delete(`/contents/${slug}/`),

  // Лайкнути
  like: (slug) => api.post(`/contents/${slug}/like/`),

  // Отримати коментарі
  getComments: (slug) => api.get(`/contents/${slug}/comments/`),

  // Додати коментар (з опціональним parent_id для відповідей)
  addComment: (slug, text, parentId = null) => {
    const data = { text };
    if (parentId) data.parent_id = parentId;
    return api.post(`/contents/${slug}/comments/`, data);
  },

  // Видалити коментар
  deleteComment: (commentId) => api.delete(`/contents/comments/${commentId}/`),

  // Мій контент
  getMy: (params = {}) => api.get('/contents/my/', { params }),
};

export const fieldsAPI = {
  // Список галузей науки
  getList: () => api.get('/contents/fields/'),

  // Отримати галузь за slug
  getBySlug: (slug) => api.get(`/contents/fields/${slug}/`),
};

export default { contentsAPI, fieldsAPI };
