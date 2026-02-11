import axios from 'axios';

// ระบบจะดึงค่าจาก Vercel Environment Variables ถ้าไม่มี (รันในเครื่อง) จะใช้ localhost
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // สำคัญมาก: เพื่อให้ส่ง Cookie/Token ข้ามโดเมนได้
  headers: {
    'Content-Type': 'application/json',
  },
});

// เพิ่ม Token ไปกับทุก Request (ถ้ามี)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- API Methods (คงเดิมตามโครงสร้างของคุณ) ---

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
};

export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getById: (id) => api.get(`/news/${id}`),
  getByCategory: (categoryId) => api.get(`/news/category/${categoryId}`),
  create: (data) => api.post('/news', data),
  update: (id, data) => api.put(`/news/${id}`, data),
  delete: (id) => api.delete(`/news/${id}`),
};

export const commentAPI = {
  getByNewsId: (newsId) => api.get(`/comments/news/${newsId}`),
  create: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
};

export default api;