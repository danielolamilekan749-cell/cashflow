import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { connectToNomba } from '../lib/nomba/auth'
import { hasNombaCredentials } from '../lib/nomba/config'
import {
  clearSession,
  getStoredSession,
  isSessionConnected,
} from '../lib/nomba/tokenStore'
import type { StoredNombaSession } from '../lib/nomba/types'

export type NombaConnectionPhase = 'locked' | 'syncing' | 'connected'

type NombaConnectionContextValue = {
  phase: NombaConnectionPhase
  hydrated: boolean
  isLocked: boolean
  isSyncing: boolean
  isConnected: boolean
  error: string | null
  session: StoredNombaSession | null
  credentialsConfigured: boolean
  startSync: () => void
  authenticate: () => Promise<boolean>
  completeSync: () => void
  resetConnection: () => void
  clearError: () => void
}

const NombaConnectionContext = createContext<NombaConnectionContextValue | null>(null)

export function NombaConnectionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<NombaConnectionPhase>('locked')
  const [hydrated, setHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<StoredNombaSession | null>(null)

  useEffect(() => {
    if (isSessionConnected()) {
      setPhase('connected')
      setSession(getStoredSession())
    }
    setHydrated(true)
  }, [])

  const startSync = useCallback(() => {
    setError(null)
    setPhase('syncing')
  }, [])

  const authenticate = useCallback(async () => {
    setError(null)

    const result = await connectToNomba({ allowDemo: !hasNombaCredentials() })

    if (!result.ok) {
      setError(result.error)
      setPhase('locked')
      return false
    }

    setSession(getStoredSession())
    return true
  }, [])

  const completeSync = useCallback(() => {
    setPhase('connected')
    setSession(getStoredSession())
  }, [])

  const resetConnection = useCallback(() => {
    clearSession()
    setSession(null)
    setError(null)
    setPhase('locked')
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({
      phase,
      hydrated,
      isLocked: phase === 'locked',
      isSyncing: phase === 'syncing',
      isConnected: phase === 'connected',
      error,
      session,
      credentialsConfigured: hasNombaCredentials(),
      startSync,
      authenticate,
      completeSync,
      resetConnection,
      clearError,
    }),
    [
      phase,
      hydrated,
      error,
      session,
      startSync,
      authenticate,
      completeSync,
      resetConnection,
      clearError,
    ],
  )

  return (
    <NombaConnectionContext.Provider value={value}>{children}</NombaConnectionContext.Provider>
  )
}

export function useNombaConnection() {
  const context = useContext(NombaConnectionContext)
  if (!context) {
    throw new Error('useNombaConnection must be used within NombaConnectionProvider')
  }
  return context
}
