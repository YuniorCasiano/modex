import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

export function useApi() {
  const { token } = useAuth()
  return useCallback((path, opts = {}) => apiFetch(path, opts, token), [token])
}