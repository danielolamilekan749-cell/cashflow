import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  issueDemoAccessToken,
  issueAccessToken,
  revokeAccessToken,
  refreshAccessToken,
} from '../lib/nomba/auth'
import {
  clearSession,
  getStoredSession,
  isSessionConnected,
  isTokenExpired,
} from '../lib/nomba/tokenStore'
import type { NombaCredentials, StoredNombaSession } from '../lib/nomba/types'

export type NombaConnectionPhase = 'locked' | 'connecting' | 'syncing' | 'connected'

type NombaConnectionContextValue = {
  phase: NombaConnectionPhase
  hydrated: boolean
  isLocked: boolean
  isConnecting: boolean
  isSyncing: boolean
  isConnected: boolean
  error: string | null
  session: StoredNombaSession | null
  // connect with user-supplied credentials
  connectWithCredentials: (creds: NombaCredentials) => Promise<boolean>
  // demo / fallback connect
  connectDemo: () => Promise<boolean>
  startSync: () => void
  completeSync: () => void
  disconnect: () => Promise<void>
  clearError: () => void
}

const NombaConnectionContext = createContext<NombaConnectionContextValue | null>(null)

export function NombaConnectionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<NombaConnectionPhase>('locked')
  const [hydrated, setHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<StoredNombaSession | null>(null)

  // Restore session on mount, auto-refresh if expiring
  useEffect(() => {
    const stored = getStoredSession()
    if (isSessionConnected() && stored) {
      if (isTokenExpired() && !stored.demoMode) {
        // try silent refresh
        refreshAccessToken().then((result) => {
          if (result.ok) {
            setSession(getStoredSession())
            setPhase('connected')
          } else {
            clearSession()
            setPhase('locked')
          }
          setHydrated(true)
        })
      } else {
        setSession(stored)
        setPhase('connected')
        setHydrated(true)
      }
    } else {
      setHydrated(true)
    }
  }, [])

  // Connect with merchant-supplied credentials
  const connectWithCredentials = useCallback(async (creds: NombaCredentials): Promise<boolean> => {
    setError(null)
    setPhase('connecting')

    const result = await issueAccessToken(creds)

    if (!result.ok) {
      setError(result.error)
      setPhase('locked')
      return false
    }

    setSession(getStoredSession())
    setPhase('syncing')
    return true
  }, [])

  // Demo/fallback connect (no real credentials)
  const connectDemo = useCallback(async (): Promise<boolean> => {
    setError(null)
    setPhase('connecting')

    const result = await issueDemoAccessToken()

    if (!result.ok) {
      setError(result.error)
      setPhase('locked')
      return false
    }

    setSession(getStoredSession())
    setPhase('syncing')
    return true
  }, [])

  const startSync = useCallback(() => {
    setPhase('syncing')
  }, [])

  const completeSync = useCallback(() => {
    setPhase('connected')
    setSession(getStoredSession())
  }, [])

  const disconnect = useCallback(async () => {
    await revokeAccessToken()
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
      isConnecting: phase === 'connecting',
      isSyncing: phase === 'syncing',
      isConnected: phase === 'connected',
      error,
      session,
      connectWithCredentials,
      connectDemo,
      startSync,
      completeSync,
      disconnect,
      clearError,
    }),
    [phase, hydrated, error, session, connectWithCredentials, connectDemo, startSync, completeSync, disconnect, clearError],
  )

  return (
    <NombaConnectionContext.Provider value={value}>{children}</NombaConnectionContext.Provider>
  )
}

export function useNombaConnection() {
  const ctx = useContext(NombaConnectionContext)
  if (!ctx) throw new Error('useNombaConnection must be used within NombaConnectionProvider')
  return ctx
}
