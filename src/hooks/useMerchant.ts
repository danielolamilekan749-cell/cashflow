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

  const isDemo = session?.demoMode ?? true
  const isSandbox = isConnected && !isDemo && session?.clientId === 'sandbox'
  const isLive = isConnected && !isDemo && session?.clientId !== 'sandbox'

  // Demo mode — show generic placeholders, not "Daniel"
  if (isDemo) {
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

  // Sandbox or live — use real account data from Nomba API
  const account = nomba.account
  const accountName = account?.accountName ?? 'Nomba Merchant'
  // Extract first name from account name for greeting
  const firstName = accountName.split(' ')[0] ?? accountName

  return {
    name: accountName,
    owner: firstName,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.accountId ?? 'merchant'}`,
    accountId: session?.accountId ?? '',
    email: account?.email ?? '—',
    phone: account?.phoneNumber ?? '—',
    currency: account?.currency ?? 'NGN',
    isDemo: false,
    isSandbox,
    isLive,
  }
}
