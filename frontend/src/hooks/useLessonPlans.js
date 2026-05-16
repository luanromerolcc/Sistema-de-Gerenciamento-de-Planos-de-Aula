import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE = '/api'

export function useLessonPlans(query) {
  return useQuery({
    queryKey: ['lesson-plans', query],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/lesson-plans`, { params: query })
      return data
    },
  })
}

export function useLessonPlan(id) {
  return useQuery({
    queryKey: ['lesson-plan', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/lesson-plans/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateLessonPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`${API_BASE}/lesson-plans`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
    },
  })
}

export function useUpdateLessonPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`${API_BASE}/lesson-plans/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
      queryClient.setQueryData(['lesson-plan', data.id], data)
    },
  })
}

export function useDeleteLessonPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_BASE}/lesson-plans/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
    },
  })
}

export function useLessonPlanVersions(id) {
  return useQuery({
    queryKey: ['lesson-plan-versions', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/lesson-plans/${id}/versions`)
      return data
    },
    enabled: !!id,
  })
}

export function useRestoreVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, vid }) => {
      const response = await axios.post(`${API_BASE}/lesson-plans/${id}/restore/${vid}`)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plan', data.id] })
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
    },
  })
}

export function useDuplicateLessonPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const response = await axios.post(`${API_BASE}/lesson-plans/${id}/duplicate`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
    },
  })
}