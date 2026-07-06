/**
 * useDebts — syncs debt records with Supabase.
 * Falls back to local state if Supabase is unreachable.
 */

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { useNombaConnection } from '../context/NombaConnectionContext'
import { debts as mockDebts } from '../data/mockData'
import type { Debt } from '../types'

function toDebt(row: Record<string, unknown>): Debt {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    phone: row.phone as string | undefined,
    amount: Number(row.amount),
    collectedDate: row.collected_date as string,
    dueDate: row.due_date as string,
    installmentProgress: Number(row.installment_progress ?? 0),
    reminderStatus: (row.reminder_status as Debt['reminderStatus']) ?? 'pending',
    category: (row.category as Debt['category']) ?? 'due-soon',
    notes: row.notes as string | undefined,
  }
}

export function useDebts() {
  const { session } = useNombaConnection()
  const accountId = session?.accountId

  const [debts, setDebts] = useState<Debt[]>(mockDebts)
  const [loading, setLoading] = useState(false)
  const [dbAvailable, setDbAvailable] = useState(false)

  // Load from Supabase on mount
  useEffect(() => {
    if (!accountId || session?.demoMode) return

    setLoading(true)
    supabase
      .from('debts')
      .select('*')
      .eq('merchant_account_id', accountId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setDbAvailable(true)
          setDebts(data.length > 0 ? data.map(toDebt) : mockDebts)
        }
        setLoading(false)
      })
  }, [accountId, session?.demoMode])

  // Add a new debt
  const addDebt = useCallback(async (debt: Omit<Debt, 'id'>) => {
    const optimisticId = Date.now().toString()
    const full: Debt = { ...debt, id: optimisticId }
    setDebts((prev) => [full, ...prev])

    if (!accountId || session?.demoMode || !dbAvailable) return

    const { data, error } = await supabase
      .from('debts')
      .insert({
        merchant_account_id: accountId,
        customer_name: debt.customerName,
        phone: debt.phone,
        amount: debt.amount,
        collected_date: debt.collectedDate,
        due_date: debt.dueDate,
        installment_progress: debt.installmentProgress,
        reminder_status: debt.reminderStatus,
        category: debt.category,
        notes: debt.notes,
      })
      .select()
      .single()

    if (!error && data) {
      // Replace optimistic ID with real DB id
      setDebts((prev) =>
        prev.map((d) => (d.id === optimisticId ? toDebt(data) : d)),
      )
    }
  }, [accountId, session?.demoMode, dbAvailable])

  // Mark as paid
  const markPaid = useCallback(async (id: string) => {
    setDebts((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, category: 'paid', installmentProgress: 100, reminderStatus: 'sent' }
          : d,
      ),
    )

    if (!accountId || session?.demoMode || !dbAvailable) return

    await supabase
      .from('debts')
      .update({ category: 'paid', installment_progress: 100, reminder_status: 'sent' })
      .eq('id', id)
      .eq('merchant_account_id', accountId)
  }, [accountId, session?.demoMode, dbAvailable])

  // Delete a debt
  const deleteDebt = useCallback(async (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id))

    if (!accountId || session?.demoMode || !dbAvailable) return

    await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('merchant_account_id', accountId)
  }, [accountId, session?.demoMode, dbAvailable])

  return { debts, loading, addDebt, markPaid, deleteDebt }
}
