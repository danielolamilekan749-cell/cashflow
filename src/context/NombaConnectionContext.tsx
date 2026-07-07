import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  issueDemoAccessToken,
  issueAccessToken,
  revokeAccessToken,
  refreshAccessToken,
  connectSandbox,
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
  connectWithCredentials: (creds: NombaCredentials) => Promise<boolean>
  connectDemo: () => Promise<boolean>
  connectToSandbox: () => Promise<boolean>
  startSync: () => void
  completeSync: () => void
  disconnect: () => Promise<void>
  clearError: () => void
}

const NombaConnectionContext = createContext<NombaConnectionContextValue | null>(null)

/** Called on first load and after session expiry — connects to Nomba sandbox silently */
async function bootSandbox(
  setSession: (s: StoredNombaSession | null) => void,
  setPhase: (p: NombaConnectionPhase) => void,
  setHydrated: (v: boolean) => void,
) {
  console.log('[CashFlow] Connecting to Nomba sandbox...')
  const result = await connectSandbox()
  if (result.ok) {
    console.log('[CashFlow] Sandbox connected ✅')
    setSession(getStoredSession())
    setPhase('connected')
  } else {
    // Sandbox unreachable — fall back to demo so the app still works
    console.warn('[CashFlow] Sandbox unreachable, using demo mode:', result.error)
    await issueDemoAccessToken()
    setSession(getStoredSession())
    setPhase('connected')
  }
  setHydrated(true)
}

export function NombaConnectionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<NombaConnectionPhase>('locked')
  const [hydrated, setHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<StoredNombaSession | null>(null)

  useEffect(() => {
    const stored = getStoredSession()

    if (isSessionConnected() && stored) {
      // Already have a session
      if (isTokenExpired() && !stored.demoMode && stored.clientId !== 'sandbox') {
        // Real credentials expired — try refresh
        refreshAccessToken().then((result) => {
          if (result.ok) {
            setSession(getStoredSession())
            setPhase('connected')
          } else {
            // Refresh failed — reconnect sandbox
            clearSession()
            bootSandbox(setSession, setPhase, setHydrated)
            return
          }
          setHydrated(true)
        })
      } else {
        // Session still valid (sandbox sessions never expire in 24h window)
        setSession(stored)
        setPhase('connected')
        setHydrated(true)
      }
    } else {
      // No session — auto-connect sandbox (no credentials needed)
      bootSandbox(setSession, setPhase, setHydrated)
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

  // Connect to Nomba sandbox — no credentials needed
  const connectToSandbox = useCallback(async (): Promise<boolean> => {
    setError(null)
    setPhase('connecting')

    const result = await connectSandbox()

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
      connectToSandbox,
      startSync,
      completeSync,
      disconnect,
      clearError,
    }),
    [phase, hydrated, error, session, connectWithCredentials, connectDemo, connectToSandbox, startSync, completeSync, disconnect, clearError],
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
