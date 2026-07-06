/**
 * useDebts — persists debt records to Supabase.
 * Logs every Supabase operation so you can see exactly what's happening.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { debts as mockDebts } from '../data/mockData'
import type { Debt } from '../types'

const LOCAL_MERCHANT_KEY = 'cashflow-merchant-id'

function getMerchantId(accountId?: string): string {
  // If we have a real accountId (from Nomba), use it
  if (accountId && accountId !== 'demo' && !accountId.startsWith('demo')) {
    return accountId
  }
  // Otherwise create/reuse a stable browser ID so demo users keep their data
  let id = localStorage.getItem(LOCAL_MERCHANT_KEY)
  if (!id) {
    id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(LOCAL_MERCHANT_KEY, id)
  }
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

export function useDebts(accountId?: string) {
  const merchantId = getMerchantId(accountId)
  const midRef = useRef(merchantId)
  midRef.current = merchantId

  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const initialised = useRef(false)

  // ── Load ────────────────────────────────────────────────────
  useEffect(() => {
    if (initialised.current) return
    initialised.current = true

    console.log('[useDebts] Loading debts for merchant:', midRef.current)

    supabase
      .from('debts')
      .select('*')
      .eq('merchant_account_id', midRef.current)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('[useDebts] Load error:', error.message, error.code, error.details)
          // Table may not exist yet — show mock data
          setDebts(mockDebts)
        } else {
          console.log('[useDebts] Loaded', data?.length ?? 0, 'debts from Supabase')
          setDebts(data && data.length > 0 ? data.map(toDebt) : mockDebts)
          // Seed DB on first visit if empty
          if (!data || data.length === 0) {
            seedMockDebts(midRef.current, mockDebts)
          }
        }
        setLoading(false)
      })
  }, [])

  // ── Add ─────────────────────────────────────────────────────
  const addDebt = useCallback(async (debt: Omit<Debt, 'id'>) => {
    setSaveError(null)

    // Optimistic UI — show immediately
    const tempId = `temp_${Date.now()}`
    setDebts((prev) => [{ ...debt, id: tempId }, ...prev])

    console.log('[useDebts] Inserting debt for merchant:', midRef.current, debt.customerName)

    const { data, error } = await supabase
      .from('debts')
      .insert({
        merchant_account_id: midRef.current,
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

    if (error) {
      console.error('[useDebts] Insert error:', error.message, '| code:', error.code, '| hint:', error.hint)
      setSaveError(`Failed to save: ${error.message}`)
      // Revert optimistic update
      setDebts((prev) => prev.filter((d) => d.id !== tempId))
    } else {
      console.log('[useDebts] Saved successfully, db id:', data.id)
      // Replace temp id with real db id
      setDebts((prev) => prev.map((d) => (d.id === tempId ? toDebt(data) : d)))
    }
  }, [])

  // ── Mark Paid ────────────────────────────────────────────────
  const markPaid = useCallback(async (id: string) => {
    setDebts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, category: 'paid', installmentProgress: 100, reminderStatus: 'sent' } : d,
      ),
    )

    const { error } = await supabase
      .from('debts')
      .update({ category: 'paid', installment_progress: 100, reminder_status: 'sent' })
      .eq('id', id)

    if (error) console.error('[useDebts] markPaid error:', error.message)
    else console.log('[useDebts] Marked paid in Supabase:', id)
  }, [])

  // ── Delete ───────────────────────────────────────────────────
  const deleteDebt = useCallback(async (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id))

    const { error } = await supabase.from('debts').delete().eq('id', id)
    if (error) console.error('[useDebts] delete error:', error.message)
    else console.log('[useDebts] Deleted from Supabase:', id)
  }, [])

  return { debts, loading, saveError, addDebt, markPaid, deleteDebt }
}

async function seedMockDebts(merchantId: string, debts: Debt[]) {
  console.log('[useDebts] Seeding mock debts for first visit...')
  const { error } = await supabase.from('debts').insert(
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
  if (error) console.error('[useDebts] Seed error:', error.message, error.code)
  else console.log('[useDebts] Mock debts seeded successfully')
}
