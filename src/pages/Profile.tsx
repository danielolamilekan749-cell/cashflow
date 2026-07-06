import { motion } from 'framer-motion'
import {
  Building2,
  Camera,
  Check,
  Edit3,
  Globe,
  Mail,
  MapPin,
  Phone,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useMerchant } from '../hooks/useMerchant'

type ProfileData = {
  fullName: string
  headline: string
  businessName: string
  email: string
  phone: string
  location: string
  website: string
  about: string
  specialties: string[]
}

export default function Profile() {
  const merchant = useMerchant()

  const defaultProfile: ProfileData = {
    fullName: merchant.owner,
    headline: merchant.isDemo ? 'Connect Nomba to see your real profile' : 'Merchant Owner · Nomba Business',
    businessName: merchant.name,
    email: merchant.email !== '—' ? merchant.email : '',
    phone: merchant.phone !== '—' ? merchant.phone : '',
    location: 'Nigeria',
    website: '',
    about: merchant.isDemo
      ? 'Connect your Nomba account to populate this profile with your real business information.'
      : `${merchant.name} — connected to Nomba ${merchant.isSandbox ? 'sandbox' : 'live'}.`,
    specialties: merchant.isDemo ? [] : ['Retail', 'Nomba Merchant'],
  }

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileData>(defaultProfile)
  const [newSpecialty, setNewSpecialty] = useState('')

  const startEdit = () => {
    setDraft({ ...profile })
    setEditing(true)
  }

  const cancelEdit = () => {
    setDraft({ ...profile })
    setEditing(false)
    setNewSpecialty('')
  }

  const saveEdit = () => {
    setProfile({ ...draft })
    setEditing(false)
    setNewSpecialty('')
  }

  const addSpecialty = () => {
    const trimmed = newSpecialty.trim()
    if (!trimmed || draft.specialties.includes(trimmed)) return
    setDraft({ ...draft, specialties: [...draft.specialties, trimmed] })
    setNewSpecialty('')
  }

  const removeSpecialty = (item: string) => {
    setDraft({ ...draft, specialties: draft.specialties.filter((s) => s !== item) })
  }

  const data = editing ? draft : profile

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-4"
    >
      {/* Cover + header card */}
      <div className="card-base overflow-hidden">
        <div className="relative h-28 bg-gradient-to-r from-brand-yellow/40 via-brand-yellow/20 to-surface-off sm:h-36">
          {editing && (
            <button
              type="button"
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-charcoal shadow-sm backdrop-blur"
            >
              <Camera className="h-3.5 w-3.5" />
              Edit cover
            </button>
          )}
        </div>

        <div className="relative px-5 pb-5 pt-0 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative -mt-10 sm:-mt-12">
                <img
                  src={merchant.avatar}
                  alt={data.fullName}
                  className="h-20 w-20 rounded-2xl border-4 border-white bg-surface-muted object-cover shadow-card sm:h-24 sm:w-24"
                />                {editing && (
                  <button
                    type="button"
                    className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink-black text-white shadow-md"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="min-w-0 pb-1">
                {editing ? (
                  <input
                    value={draft.fullName}
                    onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                    className="input-base !py-1.5 text-lg font-bold"
                  />
                ) : (
                  <h1 className="text-xl font-bold text-ink-black sm:text-2xl">{data.fullName}</h1>
                )}
                {editing ? (
                  <input
                    value={draft.headline}
                    onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                    className="input-base mt-1 !py-1.5 text-sm"
                  />
                ) : (
                  <p className="mt-0.5 text-sm text-ink-muted">{data.headline}</p>
                )}
                <p className="mt-1 text-xs text-ink-light">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {data.location}
                </p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {editing ? (
                <>
                  <button type="button" onClick={cancelEdit} className="btn-secondary text-xs">
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                  <button type="button" onClick={saveEdit} className="btn-primary text-xs">
                    <Check className="h-3.5 w-3.5" />
                    Save
                  </button>
                </>
              ) : (
                <button type="button" onClick={startEdit} className="btn-primary text-xs">
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card-base p-5 sm:p-6">
        <h2 className="text-base font-semibold text-ink-black">About</h2>
        {editing ? (
          <textarea
            value={draft.about}
            onChange={(e) => setDraft({ ...draft, about: e.target.value })}
            rows={4}
            className="input-base mt-3 resize-none"
          />
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-ink-charcoal">{data.about}</p>
        )}
      </div>

      {/* Business info */}
      <div className="card-base p-5 sm:p-6">
        <h2 className="text-base font-semibold text-ink-black">Business Information</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-surface-off px-4 py-3">
            <Building2 className="h-4 w-4 shrink-0 text-ink-muted" />
            {editing ? (
              <input
                value={draft.businessName}
                onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                className="input-base !py-1.5"
                placeholder="Business name"
              />
            ) : (
              <div>
                <p className="text-[10px] text-ink-muted">Business</p>
                <p className="text-sm font-semibold">{data.businessName}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface-off px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-ink-muted" />
            {editing ? (
              <input
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="input-base !py-1.5"
                type="email"
              />
            ) : (
              <div>
                <p className="text-[10px] text-ink-muted">Email</p>
                <p className="text-sm font-semibold">{data.email}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface-off px-4 py-3">
            <Phone className="h-4 w-4 shrink-0 text-ink-muted" />
            {editing ? (
              <input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className="input-base !py-1.5"
              />
            ) : (
              <div>
                <p className="text-[10px] text-ink-muted">Phone</p>
                <p className="text-sm font-semibold">{data.phone}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface-off px-4 py-3">
            <Globe className="h-4 w-4 shrink-0 text-ink-muted" />
            {editing ? (
              <input
                value={draft.website}
                onChange={(e) => setDraft({ ...draft, website: e.target.value })}
                className="input-base !py-1.5"
              />
            ) : (
              <div>
                <p className="text-[10px] text-ink-muted">Website</p>
                <p className="text-sm font-semibold">{data.website}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface-off px-4 py-3">
            <MapPin className="h-4 w-4 shrink-0 text-ink-muted" />
            {editing ? (
              <input
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                className="input-base !py-1.5"
              />
            ) : (
              <div>
                <p className="text-[10px] text-ink-muted">Location</p>
                <p className="text-sm font-semibold">{data.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="card-base p-5 sm:p-6">
        <h2 className="text-base font-semibold text-ink-black">Specialties</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.specialties.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1 rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-semibold text-ink-charcoal"
            >
              {item}
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSpecialty(item)}
                  className="text-ink-muted hover:text-status-danger"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="mt-3 flex gap-2">
            <input
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="Add specialty"
              className="input-base flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addSpecialty()}
            />
            <button type="button" onClick={addSpecialty} className="btn-secondary text-xs">
              Add
            </button>
          </div>
        )}
      </div>

      {/* Nomba badge */}
      <div className="card-base flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow/20">
          <Building2 className="h-6 w-6 text-brand-yellow-dark" />
        </div>
        <div>
          <p className="text-sm font-bold text-ink-black">Nomba Merchant</p>
          <p className="text-xs text-ink-muted">Verified business account · CashFlow AI enabled</p>
        </div>
        <span className="ml-auto rounded-full bg-status-success-soft px-3 py-1 text-xs font-semibold text-status-success">
          Verified
        </span>
      </div>
    </motion.div>
  )
}
