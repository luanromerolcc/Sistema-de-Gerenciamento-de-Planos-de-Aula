const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class ApiError extends Error {
  constructor(status, message, data) {
    super(message)
    this.status = status
    this.data = data
    this.name = 'ApiError'
  }
}

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'API Error', data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, error.message || 'Network error', null)
  }
}

// Lesson Plans API
export const api = {
  lessonPlans: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/lesson-plans${qs ? `?${qs}` : ''}`)
    },
    getById: (id) => request(`/lesson-plans/${id}`),
    create: (data) => request('/lesson-plans', { method: 'POST', body: data }),
    update: (id, data) => request(`/lesson-plans/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/lesson-plans/${id}`, { method: 'DELETE' }),
    duplicate: (id) => request(`/lesson-plans/${id}/duplicate`, { method: 'POST' }),
    restoreVersion: (id, versionId) => request(`/lesson-plans/${id}/versions/${versionId}/restore`, { method: 'POST' }),
    export: (id, format) => request(`/lesson-plans/${id}/export/${format}`),
  },

  ai: {
    getRecommendation: (data) => request('/ai/recommend', { method: 'POST', body: data }),
    streamRecommendation: (data) => {
      // SSE endpoint for streaming
      return `${API_BASE_URL}/ai/recommend-stream`
    },
  },

  analytics: {
    getDashboard: () => request('/analytics/dashboard'),
    getStats: () => request('/analytics/stats'),
  },

  health: {
    check: () => request('/health'),
  },
}

export { ApiError }
