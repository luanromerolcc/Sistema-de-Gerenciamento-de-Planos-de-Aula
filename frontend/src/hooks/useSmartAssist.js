import { useState, useCallback } from 'react'
import axios from 'axios'

const API_BASE = '/api'

export function useSmartAssist() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCached, setIsCached] = useState(false)

  const stream = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    setContent('')
    setIsCached(false)

    try {
      const response = await axios.get(`${API_BASE}/ai/recommend/stream`, {
        params,
        responseType: 'stream',
        onDownloadProgress: (progressEvent) => {
          const chunk = progressEvent.event.currentTarget.response
          if (chunk) {
            setContent((prev) => prev + chunk)
          }
        },
      })

      // Check for cache header
      if (response.headers['x-cached'] === 'true') {
        setIsCached(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { content, loading, error, isCached, stream }
}