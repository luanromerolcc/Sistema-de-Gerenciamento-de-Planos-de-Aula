import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFilterStore = create(
  persist(
    (set) => ({
      filters: {
        discipline: '',
        tags: [],
        scheduledFrom: null,
        scheduledTo: null,
        search: '',
        sortBy: 'scheduledAt',
        sortOrder: 'asc',
        page: 1,
        pageSize: 20,
      },
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () =>
        set({
          filters: {
            discipline: '',
            tags: [],
            scheduledFrom: null,
            scheduledTo: null,
            search: '',
            sortBy: 'scheduledAt',
            sortOrder: 'asc',
            page: 1,
            pageSize: 20,
          },
        }),
    }),
    {
      name: 'lesson-plan-filters',
      partialize: (state) => ({
        filters: {
          ...state.filters,
          page: 1, // Don't persist page
        },
      }),
    }
  )
)