import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message)
    this.status = status
    this.data = data
    this.name = 'ApiError'
  }
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Response interceptor — unwrap data, normalize errors
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      const message = data?.message || data?.error || 'API Error'
      throw new ApiError(status, message, data)
    }
    if (error.code === 'ECONNABORTED') {
      throw new ApiError(0, 'Request timed out', null)
    }
    throw new ApiError(0, error.message || 'Network error', null)
  }
)

export const api = {
  lessonPlans: {
    getAll: (params = {}) => client.get('/lesson-plans', { params }),
    getById: (id) => client.get(`/lesson-plans/${id}`),
    create: (data) => client.post('/lesson-plans', data),
    update: (id, data) => client.put(`/lesson-plans/${id}`, data),
    delete: (id) => client.delete(`/lesson-plans/${id}`),
    duplicate: (id) => client.post(`/lesson-plans/${id}/duplicate`),
    restoreVersion: (id, versionId) =>
      client.post(`/lesson-plans/${id}/versions/${versionId}/restore`),
    export: (id, format) => client.get(`/lesson-plans/${id}/export/${format}`),
  },

  ai: {
    getRecommendation: (data) => client.post('/ai/recommend', data),
    streamUrl: () => `${API_BASE_URL}/ai/recommend/stream`,
  },

  analytics: {
    getDashboard: () => client.get('/analytics/dashboard'),
    getStats: () => client.get('/analytics/stats'),
  },

  health: {
    check: () => client.get('/health'),
  },
}
