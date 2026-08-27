// hooks/useSyncCodeforces.ts (full replacement)
import { useEffect, useState } from 'react'
import {
  requestCodeforcesVerification,
  verifyCodeforcesSync,
  getCodeforcesSyncStatus,
  refreshCodeforcesSync,
} from '@/lib/api'
import type { CodeforcesSyncStatus } from '@/types'

type Step = 'loading' | 'idle' | 'awaiting_verification' | 'verifying' | 'synced'

export function useSyncCodeforces() {
  const [step, setStep] = useState<Step>('loading')
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<CodeforcesSyncStatus | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadStatus() {
      try {
        const response = await getCodeforcesSyncStatus()
        if (isCancelled) return

        if (response.success && response.data?.handle_verified) {
          setStatus(response.data)
          setStep('synced')
        } else {
          setStep('idle')
        }
      } catch {
        if (!isCancelled) setStep('idle')
      }
    }

    loadStatus()
    return () => { isCancelled = true }
  }, [])

  async function requestCode(handle: string) {
    setLoading(true)
    setError(null)
    try {
      const response = await requestCodeforcesVerification(handle)
      if (response.success && response.data) {
        setCode(response.data.code)
        setStep('awaiting_verification')
      } else {
        setError(response.error || 'Could not start verification')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function verify() {
    setStep('verifying')
    setLoading(true)
    setError(null)
    try {
      const response = await verifyCodeforcesSync()
      if (response.success && response.data) {
        setStatus(response.data.stats as unknown as CodeforcesSyncStatus)
        setStep('synced')
      } else {
        setError(response.error || 'Verification failed')
        setStep('awaiting_verification')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStep('awaiting_verification')
    } finally {
      setLoading(false)
    }
  }

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const response = await refreshCodeforcesSync()
      if (response.success && response.data) {
        setStatus(response.data.stats as unknown as CodeforcesSyncStatus)
      } else {
        setError(response.error || 'Refresh failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { step, code, loading, error, status, requestCode, verify, refresh }
}