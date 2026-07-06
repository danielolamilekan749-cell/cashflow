/**
 * useDebts — syncs debt records with Supabase.
 * Works in ALL modes: demo, sandbox, and authenticated.
 * Uses a stable merchant key (stored in localStorage) so debts
 * persist even in demo mode across page reloads.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { debts as mockDebts } from '../data/mockData'
import type { Debt } from '../types'

// Use a stable local key so demo users also get persistence
const LOCAL_MERCHANT_KEY = 'cashflow-merchant-id'

function getOrCreateMerchantId(accountId?: string): string {
  if (accountId && accountId !== 'demo') return accountId
  // For demo mode, generate a stable browser-local ID
  const existing = localStorage.getItem(LOCAL_MERCHANT_KEY)
  if (existing) return existing
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  localStorage.setItem(LOCAL_MERCHANT_KEY, id)
  return id
}

function toDebt(row: Record<string, unknown>): Debt {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    phone: (row.phone as string | null) ?? undefined,
    amount: Number(row.amount),
    collectedDate: row.collected_date as string,
    dueDate: row.due_date as string,
    installmentProgress: Number(row.installment_progress ?? 0),
    reminderStatus: (row.reminder_status as Debt['reminderStatus']) ?? 'pending',
    category: (row.category as Debt['category']) ?? 'due-soon',
    notes: (row.notes as string | null) ?? undefined,
  }
}

async function ensureMerchantProfile(merchantId: string) {
  // Upsert a minimal merchant_profiles row so the FK constraint is satisfied
  await supabase
    .from('merchant_profiles')
    .upsert({ account_id: merchantId, account_name: 'CashFlow Merchant' }, { onConflict: 'account_id' })
}

export function useDebts(accountId?: string) {
  const merchantId = getOrCreateMerchantId(accountId)
  const merchantIdRef = useRef(merchantId)
  merchantIdRef.current = merchantId

  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const loadedRef = useRef(false)

  // Load from Supabase on mount — always, regardless of demo/sandbox/real
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    setLoading(true)

    supabase
      .from('debts')
      .select('*')
      .eq('merchant_account_id', merchantIdRef.current)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setDebts(data.map(toDebt))
        } else {
          // First time — seed with mock debts and save them
          setDebts(mockDebts)
          seedMockDebts(merchantIdRef.current, mockDebts)
        }
        setLoading(false)
      })
      .catch(() => {
        setDebts(mockDebts)
        setLoading(false)
      })
  }, [])

  // Add a new debt
  const addDebt = useCallback(async (debt: Omit<Debt, 'id'>) => {
    const optimisticId = `opt_${Date.now()}`
    const optimistic: Debt = { ...debt, id: optimisticId }
    setDebts((prev) => [optimistic, ...prev])

    try {
      await ensureMerchantProfile(merchantIdRef.current)

      const { data, error } = await supabase
        .from('debts')
        .insert({
          merchant_account_id: merchantIdRef.current,
          customer_name: debt.customerName,
          phone: debt.phone ?? null,
          amount: debt.amount,
          collected_date: debt.collectedDate,
          due_date: debt.dueDate,
          installment_progress: debt.installmentProgress,
          reminder_status: debt.reminderStatus,
          category: debt.category,
          notes: debt.notes ?? null,
        })
        .select()
        .single()

      if (!error && data) {
        setDebts((prev) =>
          prev.map((d) => (d.id === optimisticId ? toDebt(data) : d)),
        )
      } else if (error) {
        console.error('Supabase insert error:', error.message)
      }
    } catch (err) {
      console.error('Failed to save debt to Supabase:', err)
      // Keep optimistic update — debt still shows in UI
    }
  }, [])

  // Mark as paid
  const markPaid = useCallback(async (id: string) => {
    setDebts((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, category: 'paid', installmentProgress: 100, reminderStatus: 'sent' }
          : d,
      ),
    )

    try {
      await supabase
        .from('debts')
        .update({ category: 'paid', installment_progress: 100, reminder_status: 'sent' })
        .eq('id', id)
    } catch (err) {
      console.error('Failed to mark debt paid in Supabase:', err)
    }
  }, [])

  // Delete a debt
  const deleteDebt = useCallback(async (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id))

    try {
      await supabase.from('debts').delete().eq('id', id)
    } catch (err) {
      console.error('Failed to delete debt from Supabase:', err)
    }
  }, [])

  return { debts, loading, addDebt, markPaid, deleteDebt }
}

// Seed the DB with mock debts on first visit
async function seedMockDebts(merchantId: string, debts: Debt[]) {
  try {
    await ensureMerchantProfile(merchantId)
    await supabase.from('debts').insert(
      debts.map((d) => ({
        id: d.id,
        merchant_account_id: merchantId,
        customer_name: d.customerName,
        phone: d.phone ?? null,
        amount: d.amount,
        collected_date: d.collectedDate,
        due_date: d.dueDate,
        installment_progress: d.installmentProgress,
        reminder_status: d.reminderStatus,
        category: d.category,
        notes: d.notes ?? null,
      })),
    )
  } catch {
    // Non-fatal — UI already has the mock data in state
  }
}
