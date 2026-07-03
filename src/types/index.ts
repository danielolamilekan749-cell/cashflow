import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  id: string
  label: string
  path: string
  icon: LucideIcon
}

export type KPI = {
  id: string
  label: string
  value: string
  change: number
  changeLabel: string
  icon: LucideIcon
  sparkline: number[]
  accent?: 'default' | 'success' | 'warning' | 'danger'
}

export type AIInsight = {
  id: string
  title: string
  description: string
  type: 'warning' | 'success' | 'info' | 'alert'
  action?: string
}

export type Product = {
  id: string
  name: string
  image: string
  revenue: number
  unitsSold: number
  profitMargin: number
  stockLevel: number
  status: 'best-seller' | 'trending' | 'slow' | 'attention'
  aiRecommendation?: string
}

export type Customer = {
  id: string
  name: string
  avatar: string
  tier: 'gold' | 'silver' | 'bronze'
  totalSpend: number
  lastPurchase: string
  frequencyScore: number
  loyaltyRating: number
  healthScore: number
}

export type Debt = {
  id: string
  customerName: string
  amount: number
  collectedDate: string
  dueDate: string
  installmentProgress: number
  reminderStatus: 'sent' | 'pending' | 'overdue'
  category: 'overdue' | 'due-soon' | 'paid'
  phone?: string
  notes?: string
}

export type Campaign = {
  id: string
  name: string
  type: 'discount' | 'loyalty' | 'reengagement' | 'birthday' | 'seasonal'
  status: 'active' | 'paused' | 'completed'
  openRate: number
  redemptionRate: number
  revenueGenerated: number
}

export type Notification = {
  id: string
  title: string
  message: string
  time: string
  type: 'payment' | 'growth' | 'inventory' | 'ai' | 'customer'
  read: boolean
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  actions?: string[]
}

export type ChartPeriod = 'today' | '7d' | '30d' | '90d' | '12m'
