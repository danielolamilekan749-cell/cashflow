import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Phone,
  Plus,
  Send,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import Modal from '../components/ui/Modal'
import { debts as initialDebts } from '../data/mockData'
import type { Debt } from '../types'
import { formatCurrency } from '../utils/format'

type DebtFilter = 'all' | 'overdue' | 'due-soon' | 'paid'

const categoryConfig = {
  overdue: {
    label: 'Overdue',
    icon: AlertCircle,
    color: 'text-status-danger',
    bg: 'bg-status-danger-soft',
    border: 'border-status-danger/20',
  },
  'due-soon': {
    label: 'Due Soon',
    icon: Clock,
    color: 'text-status-warning',
    bg: 'bg-status-warning-soft',
    border: 'border-status-warning/20',
  },
  paid: {
    label: 'Paid',
    icon: CheckCircle,
    color: 'text-status-success',
    bg: 'bg-status-success-soft',
    border: 'border-status-success/20',
  },
}

const emptyForm = {
  customerName: '',
  phone: '',
  amount: '',
  collectedDate: '',
  dueDate: '',
  notes: '',
}

function deriveCategory(dueDate: string): Debt['category'] {
  const due = new Date(dueDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  if (due < now) return 'overdue'
  const week = new Date(now)
  week.setDate(week.getDate() + 14)
  if (due <= week) return 'due-soon'
  return 'due-soon'
}

export default function DebtTracker() {
  const [debtList, setDebtList] = useState<Debt[]>(initialDebts)
  const [filter, setFilter] = useState<DebtFilter>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() => {
    if (filter === 'all') return debtList
    return debtList.filter((d) => d.category === filter)
  }, [debtList, filter])

  const totalOutstanding = debtList
    .filter((d) => d.category !== 'paid')
    .reduce((sum, d) => sum + d.amount, 0)

  const filters: { key: DebtFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'due-soon', label: 'Due Soon' },
    { key: 'paid', label: 'Paid' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.customerName || !amount || !form.collectedDate || !form.dueDate) return

    const category = deriveCategory(form.dueDate)
    const newDebt: Debt = {
      id: Date.now().toString(),
      customerName: form.customerName.trim(),
      phone: form.phone.trim() || undefined,
      amount,
      collectedDate: form.collectedDate,
      dueDate: form.dueDate,
      installmentProgress: 0,
      reminderStatus: category === 'overdue' ? 'overdue' : 'pending',
      category,
      notes: form.notes.trim() || undefined,
    }

    setDebtList((prev) => [newDebt, ...prev])
    setForm(emptyForm)
    setModalOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-black">Debt Tracker</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Manage outstanding debts and payment reminders
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="card-base shrink-0 px-4 py-2.5">
            <p className="text-[10px] text-ink-muted">Total Outstanding</p>
            <p className="text-lg font-bold text-status-warning">
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary text-xs">
            <Plus className="h-4 w-4" />
            Add Debt
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === f.key
                ? 'bg-brand-yellow text-ink-black shadow-sm'
                : 'bg-white text-ink-muted hover:bg-surface-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {filtered.map((debt, i) => {
          const config = categoryConfig[debt.category]
          return (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`card-base card-hover border p-3.5 ${config.border}`}
            >
              <div className="flex items-start justify-between gap-1">
                <h3 className="truncate text-sm font-bold text-ink-black">
                  {debt.customerName}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${config.bg} ${config.color}`}
                >
                  {config.label}
                </span>
              </div>

              <p className="mt-1 text-base font-bold text-ink-black sm:text-lg">
                {formatCurrency(debt.amount)}
              </p>

              <div className="mt-1.5 space-y-0.5 text-[10px] text-ink-muted">
                <p>
                  Collected{' '}
                  {new Date(debt.collectedDate).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <p>
                  Due{' '}
                  {new Date(debt.dueDate).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>

              <div className="mt-2.5">
                <div className="mb-1 flex justify-between text-[10px]">
                  <span className="text-ink-muted">Progress</span>
                  <span className="font-semibold">{debt.installmentProgress}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={`h-full rounded-full ${
                      debt.installmentProgress === 100 ? 'bg-status-success' : 'bg-brand-yellow'
                    }`}
                    style={{ width: `${debt.installmentProgress}%` }}
                  />
                </div>
              </div>

              {debt.category !== 'paid' && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  <button
                    className="flex items-center gap-0.5 rounded-md bg-brand-yellow/15 px-2 py-1 text-[10px] font-semibold hover:bg-brand-yellow/25"
                  >
                    <Send className="h-2.5 w-2.5" /> Remind
                  </button>
                  <button
                    className="flex items-center gap-0.5 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-semibold text-ink-muted hover:bg-surface-muted"
                  >
                    <Phone className="h-2.5 w-2.5" />
                  </button>
                  <button
                    className="flex items-center gap-0.5 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-semibold text-ink-muted hover:bg-surface-muted"
                  >
                    <CheckCircle className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card-base flex flex-col items-center py-12 text-center">
          <p className="text-sm font-semibold text-ink-charcoal">No debts found</p>
          <p className="mt-1 text-xs text-ink-muted">Add a new debt to get started</p>
        </div>
      )}

      <div className="flex justify-end">
        <button className="btn-secondary text-xs">
          <Download className="h-3.5 w-3.5" />
          Export Report
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Debt"
        subtitle="Record a debt with collection and payment dates"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">
              Customer Name
            </label>
            <input
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="e.g. John Okafor"
              className="input-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">
              Phone Number
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234 801 234 5678"
              className="input-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">
              Debt Amount (₦)
            </label>
            <input
              required
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="e.g. 50000"
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">
                Date Collected
              </label>
              <input
                required
                type="date"
                value={form.collectedDate}
                onChange={(e) => setForm({ ...form, collectedDate: e.target.value })}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">
                Due Date (Pay Day)
              </label>
              <input
                required
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Payment terms, items purchased..."
              rows={3}
              className="input-base resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1 text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 text-sm">
              Save Debt
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
