import { motion } from 'framer-motion'
import { Bell, Building2, CreditCard, ExternalLink, Monitor, Shield, User } from 'lucide-react'
import { useNombaConnection } from '../context/NombaConnectionContext'
import { useNombaData } from '../hooks/useNombaData'
import { merchant } from '../data/mockData'
import { useState } from 'react'

export default function Settings() {
  const { isConnected, session, disconnect } = useNombaConnection()
  const nomba = useNombaData()

  const isDemo = session?.demoMode ?? true
  const liveAccount = !isDemo && nomba.account

  const integrationStatus = isConnected
    ? session?.demoMode
      ? 'Demo mode'
      : `Connected · ${session?.environment ?? 'sandbox'}`
    : 'Not connected'

  const [toggles, setToggles] = useState([
    { id: 'payments', label: 'Payment alerts', enabled: true },
    { id: 'insights', label: 'AI insights', enabled: true },
    { id: 'inventory', label: 'Low inventory warnings', enabled: true },
    { id: 'campaigns', label: 'Campaign updates', enabled: false },
  ])

  const toggle = (id: string) =>
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-ink-black">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage your account and preferences</p>
      </div>

      {/* Profile card — uses live data if available */}
      <div className="flex items-center gap-4 rounded-card border border-gray-100 bg-white p-5 shadow-card">
        <img
          src={merchant.avatar}
          alt={liveAccount?.accountName ?? merchant.owner}
          className="h-16 w-16 rounded-2xl bg-surface-muted"
        />
        <div>
          <h2 className="text-lg font-bold text-ink-black">
            {liveAccount?.accountName ?? merchant.owner}
          </h2>
          <p className="text-sm text-ink-muted">{merchant.name}</p>
          <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isConnected && !isDemo
              ? 'bg-status-success-soft text-status-success'
              : 'bg-brand-yellow/15 text-brand-yellow-dark'
          }`}>
            {isConnected && !isDemo ? '● Live' : 'Nomba Merchant'}
          </span>
        </div>
      </div>

      {/* Business Profile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-brand-yellow-dark" />
          <h2 className="font-semibold text-ink-black">Business Profile</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Business Name', value: liveAccount?.accountName ?? merchant.name },
            { label: 'Account ID', value: session?.accountId ?? '—' },
            { label: 'Status', value: liveAccount?.status ?? 'Unknown' },
            { label: 'Currency', value: liveAccount?.currency ?? 'NGN' },
          ].map((f) => (
            <div key={f.label} className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3">
              <span className="text-sm text-ink-muted">{f.label}</span>
              <span className="text-sm font-semibold text-ink-black">{f.value}</span>
            </div>
          ))}
          {liveAccount?.banks?.map((bank) => (
            <div key={bank.bankAccountNumber} className="rounded-xl border border-brand-yellow/20 bg-brand-yellow/5 px-4 py-3">
              <p className="text-xs font-semibold text-ink-charcoal">{bank.bankName}</p>
              <p className="text-sm font-bold text-ink-black">{bank.bankAccountNumber}</p>
              <p className="text-xs text-ink-muted">{bank.bankAccountName}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-base p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-brand-yellow-dark" />
          <h2 className="font-semibold text-ink-black">Account</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Email', value: liveAccount?.email ?? 'daniel@provisions.ng' },
            { label: 'Phone', value: liveAccount?.phoneNumber ?? '+234 801 234 5678' },
          ].map((f) => (
            <div key={f.label} className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3">
              <span className="text-sm text-ink-muted">{f.label}</span>
              <span className="text-sm font-semibold text-ink-black">{f.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Terminals */}
      {!isDemo && nomba.terminals && nomba.terminals.results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-base p-6">
          <div className="mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-brand-yellow-dark" />
            <h2 className="font-semibold text-ink-black">POS Terminals</h2>
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-ink-muted">
              {nomba.terminals.results.length}
            </span>
          </div>
          <div className="space-y-3">
            {nomba.terminals.results.map((t) => (
              <div key={t.terminalId} className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink-black">{t.terminalLabel || t.terminalId}</p>
                  <p className="text-xs text-ink-muted">S/N: {t.serialNumber}</p>
                </div>
                <span className="rounded-lg bg-status-success-soft px-2 py-1 text-xs font-semibold text-status-success">Active</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-base p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-yellow-dark" />
          <h2 className="font-semibold text-ink-black">Notifications</h2>
        </div>
        <div className="space-y-3">
          {toggles.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3">
              <span className="text-sm text-ink-charcoal">{t.label}</span>
              <button
                onClick={() => toggle(t.id)}
                className={`relative h-6 w-11 rounded-full transition-colors ${t.enabled ? 'bg-brand-yellow' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${t.enabled ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Integrations */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base p-6">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-yellow-dark" />
          <h2 className="font-semibold text-ink-black">Integrations</h2>
        </div>
        <div className="space-y-3">
          {[
            {
              label: 'Nomba Account',
              value: integrationStatus,
              highlight: isConnected && !isDemo,
            },
            {
              label: 'Account Balance',
              value: nomba.balance
                ? `₦${parseFloat(nomba.balance.amount).toLocaleString('en-NG')}`
                : isDemo ? 'Demo mode' : '—',
              highlight: false,
            },
            {
              label: 'Sub-accounts',
              value: nomba.subAccounts ? String(nomba.subAccounts.results.length) : '—',
              highlight: false,
            },
          ].map((f) => (
            <div key={f.label} className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3">
              <span className="text-sm text-ink-muted">{f.label}</span>
              <span className={`text-sm font-semibold ${f.highlight ? 'text-status-success' : 'text-ink-black'}`}>
                {f.value}
              </span>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://developer.nomba.com/docs/getting-started/get-api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-yellow-dark hover:underline"
            >
              Nomba API docs <ExternalLink className="h-3 w-3" />
            </a>
            {isConnected && (
              <button
                type="button"
                onClick={disconnect}
                className="text-xs font-semibold text-status-danger hover:underline"
              >
                Disconnect Nomba
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-base p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-yellow-dark" />
          <h2 className="font-semibold text-ink-black">Security</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3">
            <span className="text-sm text-ink-muted">Two-factor authentication</span>
            <span className="text-sm font-semibold text-status-success">Enabled</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3">
            <span className="text-sm text-ink-muted">API environment</span>
            <span className="text-sm font-semibold text-ink-black capitalize">
              {session?.environment ?? 'Not connected'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
