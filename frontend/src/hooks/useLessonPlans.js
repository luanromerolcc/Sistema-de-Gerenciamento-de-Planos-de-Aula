import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export function useLessonPlans(params = {}) {
  return useQuery({
    queryKey: ['lesson-plans', params],
    queryFn: () => api.lessonPlans.getAll(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useLessonPlan(id) {
  return useQuery({
    queryKey: ['lesson-plan', id],
    queryFn: () => api.lessonPlans.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateLessonPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.lessonPlans.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
    },
  })
}

export function useUpdateLessonPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.lessonPlans.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
      queryClient.setQueryData(['lesson-plan', data.id], data)
    },
  })
}

export function useDeleteLessonPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.lessonPlans.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
    },
  })
}

export function useDuplicateLessonPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.lessonPlans.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
    },
  })
}