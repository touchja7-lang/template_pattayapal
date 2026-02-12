import axios from 'axios';

// ตรวจสอบตัวแปรจาก Vercel ถ้าไม่มีให้ใช้ localhost
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ส่ง Token ไปด้วยทุกครั้ง (ถ้ามี)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- เพิ่มส่วนการ Export ด้านล่างนี้เพื่อให้ไฟล์อื่นเรียกใช้ได้ ---

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getById: (id) => api.get(`/news/${id}`),
  create: (data) => api.post('/news', data),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

export default api;