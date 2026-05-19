import { useState, useCallback } from 'react'
import { api } from '../services/api'

export function useSmartAssist() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCached, setIsCached] = useState(false)

  const stream = useCallback(async (data, onDone) => {
    setIsLoading(true)
    setError(null)
    setIsCached(false)

    try {
      const qs = new URLSearchParams(data).toString()
      const eventSource = new EventSource(`${api.ai.streamUrl()}?${qs}`)

      eventSource.addEventListener('done', (event) => {
        const result = JSON.parse(event.data)
        setIsCached(result.cached || false)
        eventSource.close()
        setIsLoading(false)
        onDone?.(result)
      })

      eventSource.addEventListener('error', (event) => {
        const err = new Error(event.data || 'Streaming error')
        setError(err)
        setIsLoading(false)
        eventSource.close()
        onDone?.(null)
      })

      return eventSource
    } catch (err) {
      setError(err)
      setIsLoading(false)
    }
  }, [])

  const getRecommendation = useCallback(async (data) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await api.ai.getRecommendation(data)
      setIsCached(result.cached || false)
      setIsLoading(false)
      return result
    } catch (err) {
      setError(err)
      setIsLoading(false)
      throw err
    }
  }, [])

  return {
    stream,
    getRecommendation,
    isLoading,
    error,
    isCached,
  }
}