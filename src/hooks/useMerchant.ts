/**
 * useMerchant — single source of truth for merchant identity.
 * Returns live Nomba account data when connected to sandbox/production.
 * Returns generic placeholder (not "Daniel") in demo mode.
 */

import { useNombaConnection } from '../context/NombaConnectionContext'
import { useNombaData } from './useNombaData'

export type MerchantInfo = {
  name: string        // Business name
  owner: string       // Owner / account holder name
  avatar: string      // Avatar URL
  accountId: string
  email: string
  phone: string
  currency: string
  isDemo: boolean
  isSandbox: boolean
  isLive: boolean
}

const GENERIC_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=merchant'

export function useMerchant(): MerchantInfo {
  const { session, isConnected } = useNombaConnection()
  const nomba = useNombaData()

  // A session is sandbox if clientId is 'sandbox' (auto-connected)
  // A session is live if it has real credentials
  // A session is demo ONLY if explicitly flagged demoMode AND sandbox failed
  const isSandbox = isConnected && session?.clientId === 'sandbox'
  const isLive = isConnected && !session?.demoMode && session?.clientId !== 'sandbox'
  const isDemo = isConnected && session?.demoMode === true && !isSandbox

  // Sandbox connected — show real Nomba sandbox account data
  if (isSandbox || isLive) {
    const account = nomba.account
    const accountName = account?.accountName ?? 'Nomba Sandbox Merchant'
    const firstName = accountName.split(/[\s/]/)[0] ?? accountName

    return {
      name: accountName,
      owner: firstName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.accountId ?? 'sandbox'}`,
      accountId: session?.accountId ?? '',
      email: account?.email ?? '—',
      phone: account?.phoneNumber ?? '—',
      currency: account?.currency ?? 'NGN',
      isDemo: false,
      isSandbox,
      isLive,
    }
  }

  // Fallback demo (only when sandbox is genuinely unreachable)
  return {
    name: 'Your Business',
    owner: 'Merchant',
    avatar: GENERIC_AVATAR,
    accountId: '',
    email: '—',
    phone: '—',
    currency: 'NGN',
    isDemo: true,
    isSandbox: false,
    isLive: false,
  }
}
