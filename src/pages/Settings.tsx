import { motion } from 'framer-motion'
import { Bell, Building2, CreditCard, ExternalLink, Shield, User } from 'lucide-react'
import { useNombaConnection } from '../context/NombaConnectionContext'
import { merchant } from '../data/mockData'

export default function Settings() {
  const { isConnected, session, disconnect } = useNombaConnection()

  const integrationStatus = isConnected
    ? session?.demoMode
      ? 'Demo mode'
      : `Connected · ${session?.environment ?? 'sandbox'}`
    : 'Not connected'

  const settingsSections = [
    {
      title: 'Business Profile',
      icon: Building2,
      fields: [
        { label: 'Business Name', value: merchant.name },
        { label: 'Owner Name', value: merchant.owner },
        { label: 'Business Type', value: 'Provisions & Groceries' },
      ],
    },
    {
      title: 'Account',
      icon: User,
      fields: [
        { label: 'Email', value: 'daniel@provisions.ng' },
        { label: 'Phone', value: '+234 801 234 5678' },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      toggles: [
        { label: 'Payment alerts', enabled: true },
        { label: 'AI insights', enabled: true },
        { label: 'Low inventory warnings', enabled: true },
        { label: 'Campaign updates', enabled: false },
      ],
    },
    {
      title: 'Integrations',
      icon: CreditCard,
      fields: [
        { label: 'Nomba Account', value: integrationStatus },
        {
          label: 'API Keys',
          value: session && !session.demoMode ? 'Configured' : 'Demo mode',
        },
      ],
    },
    {
      title: 'Security',
      icon: Shield,
      fields: [{ label: 'Two-factor authentication', value: 'Enabled' }],
    },
  ]

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

      <div className="flex items-center gap-4 rounded-card border border-gray-100 bg-white p-5 shadow-card">
        <img
          src={merchant.avatar}
          alt={merchant.owner}
          className="h-16 w-16 rounded-2xl bg-surface-muted"
        />
        <div>
          <h2 className="text-lg font-bold text-ink-black">{merchant.owner}</h2>
          <p className="text-sm text-ink-muted">{merchant.name}</p>
          <span className="mt-1 inline-block rounded-full bg-brand-yellow/15 px-2.5 py-0.5 text-xs font-semibold text-brand-yellow-dark">
            Nomba Merchant
          </span>
        </div>
      </div>

      {settingsSections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card-base p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <section.icon className="h-5 w-5 text-brand-yellow-dark" />
            <h2 className="font-semibold text-ink-black">{section.title}</h2>
          </div>

          {section.fields && (
            <div className="space-y-3">
              {section.fields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3"
                >
                  <span className="text-sm text-ink-muted">{field.label}</span>
                  <span
                    className={`text-sm font-semibold ${
                      field.label === 'Nomba Account' && isConnected && !session?.demoMode
                        ? 'text-status-success'
                        : 'text-ink-black'
                    }`}
                  >
                    {field.value}
                  </span>
                </div>
              ))}

              {section.title === 'Integrations' && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="https://developer.nomba.com/docs/getting-started/get-api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-yellow-dark hover:underline"
                  >
                    Nomba API documentation
                    <ExternalLink className="h-3 w-3" />
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
              )}
            </div>
          )}

          {section.toggles && (
            <div className="space-y-3">
              {section.toggles.map((toggle) => (
                <div
                  key={toggle.label}
                  className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3"
                >
                  <span className="text-sm text-ink-charcoal">{toggle.label}</span>
                  <button
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      toggle.enabled ? 'bg-brand-yellow' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        toggle.enabled ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}
