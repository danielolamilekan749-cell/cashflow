import {
  Banknote,
  Calendar,
  CalendarDays,
  CreditCard,
  DollarSign,
  Package,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import type {
  AIInsight,
  Campaign,
  ChatMessage,
  Customer,
  Debt,
  KPI,
  Notification,
  Product,
} from '../types'

export const merchant = {
  name: "Daniel's Provisions",
  owner: 'Daniel',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
  todayRevenue: 284500,
}

export const businessHealth = {
  score: 87,
  percentile: 78,
  summary:
    'Your business is performing better than 78% of similar merchants this week.',
}

export const kpis: KPI[] = [
  {
    id: 'today-revenue',
    label: "Today's Revenue",
    value: '₦284,500',
    change: 12.4,
    changeLabel: 'vs yesterday',
    icon: Banknote,
    sparkline: [42, 38, 55, 48, 62, 58, 72],
  },
  {
    id: 'weekly-revenue',
    label: 'Weekly Revenue',
    value: '₦1.8M',
    change: 8.2,
    changeLabel: 'vs last week',
    icon: Calendar,
    sparkline: [30, 45, 38, 52, 48, 65, 70],
  },
  {
    id: 'monthly-revenue',
    label: 'Monthly Revenue',
    value: '₦6.4M',
    change: 15.6,
    changeLabel: 'vs last month',
    icon: CalendarDays,
    sparkline: [25, 35, 42, 48, 55, 62, 68, 72],
  },
  {
    id: 'total-customers',
    label: 'Total Customers',
    value: '1,248',
    change: 5.3,
    changeLabel: 'new this month',
    icon: Users,
    sparkline: [20, 25, 28, 32, 35, 38, 42],
  },
  {
    id: 'outstanding-debts',
    label: 'Outstanding Debts',
    value: '₦425,000',
    change: -8.1,
    changeLabel: 'reduced',
    icon: CreditCard,
    sparkline: [80, 75, 70, 68, 62, 58, 55],
    accent: 'warning',
  },
  {
    id: 'returning-customers',
    label: 'Returning Customers',
    value: '342',
    change: 11.2,
    changeLabel: 'this week',
    icon: RefreshCw,
    sparkline: [35, 38, 42, 45, 48, 52, 55],
    accent: 'success',
  },
  {
    id: 'avg-order',
    label: 'Avg Order Value',
    value: '₦8,450',
    change: 3.8,
    changeLabel: 'vs last week',
    icon: Wallet,
    sparkline: [40, 42, 41, 43, 45, 44, 46],
  },
  {
    id: 'revenue-growth',
    label: 'Revenue Growth',
    value: '+18.4%',
    change: 18.4,
    changeLabel: 'month over month',
    icon: TrendingUp,
    sparkline: [10, 15, 18, 22, 25, 28, 32],
    accent: 'success',
  },
  {
    id: 'best-product',
    label: 'Best Selling Product',
    value: 'Rice 50kg',
    change: 24.5,
    changeLabel: 'units sold',
    icon: Package,
    sparkline: [50, 55, 60, 58, 65, 70, 75],
    accent: 'success',
  },
  {
    id: 'slow-product',
    label: 'Slow Selling Product',
    value: 'Palm Oil 5L',
    change: -14.2,
    changeLabel: 'vs last week',
    icon: TrendingDown,
    sparkline: [60, 55, 50, 45, 40, 35, 30],
    accent: 'danger',
  },
]

export const aiInsights: AIInsight[] = [
  {
    id: '1',
    title: 'Sales dip detected',
    description:
      'Sales dropped 14% this week due to reduced evening purchases between 6PM–9PM.',
    type: 'warning',
    action: 'View Analysis',
  },
  {
    id: '2',
    title: 'Top performer',
    description: 'Rice 50kg remains your best-selling product with 847 units sold.',
    type: 'success',
    action: 'Restock Now',
  },
  {
    id: '3',
    title: 'Churn risk alert',
    description: '12 customers are likely to stop buying soon based on purchase patterns.',
    type: 'alert',
    action: 'Send Campaign',
  },
  {
    id: '4',
    title: 'Debt reminder',
    description: '3 debtors have overdue payments totaling ₦185,000.',
    type: 'warning',
    action: 'Send Reminders',
  },
  {
    id: '5',
    title: 'Slow period insight',
    description: 'Tuesday between 2PM and 5PM is your slowest period. Consider promotions.',
    type: 'info',
    action: 'Create Coupon',
  },
  {
    id: '6',
    title: 'Growth opportunity',
    description: 'Weekend sales are up 22%. Extend weekend hours for more revenue.',
    type: 'success',
    action: 'View Details',
  },
]

export const revenueChartData = [
  { name: 'Mon', revenue: 420000, sales: 52, customers: 38, profit: 126000 },
  { name: 'Tue', revenue: 380000, sales: 48, customers: 35, profit: 114000 },
  { name: 'Wed', revenue: 510000, sales: 64, customers: 42, profit: 153000 },
  { name: 'Thu', revenue: 470000, sales: 58, customers: 40, profit: 141000 },
  { name: 'Fri', revenue: 620000, sales: 78, customers: 55, profit: 186000 },
  { name: 'Sat', revenue: 780000, sales: 95, customers: 68, profit: 234000 },
  { name: 'Sun', revenue: 650000, sales: 82, customers: 58, profit: 195000 },
]

export const monthlyChartData = [
  { name: 'Jan', revenue: 4200000, sales: 520, customers: 380, profit: 1260000 },
  { name: 'Feb', revenue: 4800000, sales: 580, customers: 420, profit: 1440000 },
  { name: 'Mar', revenue: 5100000, sales: 620, customers: 450, profit: 1530000 },
  { name: 'Apr', revenue: 5400000, sales: 650, customers: 480, profit: 1620000 },
  { name: 'May', revenue: 5800000, sales: 690, customers: 510, profit: 1740000 },
  { name: 'Jun', revenue: 6400000, sales: 750, customers: 560, profit: 1920000 },
]

export const products: Product[] = [
  {
    id: '1',
    name: 'Rice 50kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop',
    revenue: 2840000,
    unitsSold: 847,
    profitMargin: 18,
    stockLevel: 42,
    status: 'best-seller',
    aiRecommendation: 'Restock within 5 days to avoid stockout',
  },
  {
    id: '2',
    name: 'Vegetable Oil 5L',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
    revenue: 1240000,
    unitsSold: 412,
    profitMargin: 22,
    stockLevel: 68,
    status: 'trending',
    aiRecommendation: 'Bundle with Rice for 15% uplift in AOV',
  },
  {
    id: '3',
    name: 'Sugar 1kg',
    image: 'https://images.unsplash.com/photo-1581447993093-4956e9c7e8b5?w=200&h=200&fit=crop',
    revenue: 890000,
    unitsSold: 623,
    profitMargin: 15,
    stockLevel: 120,
    status: 'trending',
  },
  {
    id: '4',
    name: 'Palm Oil 5L',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
    revenue: 320000,
    unitsSold: 89,
    profitMargin: 12,
    stockLevel: 45,
    status: 'slow',
    aiRecommendation: 'Run a 10% discount campaign to clear inventory',
  },
  {
    id: '5',
    name: 'Tomato Paste',
    image: 'https://images.unsplash.com/photo-1546470427-e26264be0f40?w=200&h=200&fit=crop',
    revenue: 180000,
    unitsSold: 56,
    profitMargin: 20,
    stockLevel: 8,
    status: 'attention',
    aiRecommendation: 'Critical stock level — reorder immediately',
  },
]

export const customers: Customer[] = [
  {
    id: '1',
    name: 'Adaeze Okonkwo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adaeze',
    tier: 'gold',
    totalSpend: 1240000,
    lastPurchase: '2 days ago',
    frequencyScore: 92,
    loyaltyRating: 95,
    healthScore: 98,
  },
  {
    id: '2',
    name: 'Chidi Eze',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chidi',
    tier: 'gold',
    totalSpend: 980000,
    lastPurchase: '1 day ago',
    frequencyScore: 88,
    loyaltyRating: 90,
    healthScore: 94,
  },
  {
    id: '3',
    name: 'Fatima Bello',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    tier: 'silver',
    totalSpend: 540000,
    lastPurchase: '5 days ago',
    frequencyScore: 72,
    loyaltyRating: 78,
    healthScore: 82,
  },
  {
    id: '4',
    name: 'Emeka Nwosu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka',
    tier: 'silver',
    totalSpend: 420000,
    lastPurchase: '1 week ago',
    frequencyScore: 65,
    loyaltyRating: 70,
    healthScore: 75,
  },
  {
    id: '5',
    name: 'Grace Adeyemi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace',
    tier: 'bronze',
    totalSpend: 180000,
    lastPurchase: '3 weeks ago',
    frequencyScore: 42,
    loyaltyRating: 55,
    healthScore: 48,
  },
  {
    id: '6',
    name: 'Ibrahim Musa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim',
    tier: 'bronze',
    totalSpend: 95000,
    lastPurchase: '1 month ago',
    frequencyScore: 28,
    loyaltyRating: 35,
    healthScore: 32,
  },
]

export const debts: Debt[] = [
  {
    id: '1',
    customerName: 'John Okafor',
    amount: 85000,
    collectedDate: '2025-05-01',
    dueDate: '2025-06-15',
    installmentProgress: 60,
    reminderStatus: 'overdue',
    category: 'overdue',
  },
  {
    id: '2',
    customerName: 'Mary Adebayo',
    amount: 62000,
    collectedDate: '2025-05-10',
    dueDate: '2025-06-18',
    installmentProgress: 40,
    reminderStatus: 'overdue',
    category: 'overdue',
  },
  {
    id: '3',
    customerName: 'Peter Nnamdi',
    amount: 38000,
    collectedDate: '2025-06-01',
    dueDate: '2025-06-25',
    installmentProgress: 75,
    reminderStatus: 'sent',
    category: 'due-soon',
  },
  {
    id: '4',
    customerName: 'Sarah Okoro',
    amount: 45000,
    collectedDate: '2025-06-05',
    dueDate: '2025-06-28',
    installmentProgress: 50,
    reminderStatus: 'pending',
    category: 'due-soon',
  },
  {
    id: '5',
    customerName: 'David Eze',
    amount: 195000,
    collectedDate: '2025-04-01',
    dueDate: '2025-06-01',
    installmentProgress: 100,
    reminderStatus: 'sent',
    category: 'paid',
  },
]

export const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Weekend Flash Sale',
    type: 'discount',
    status: 'active',
    openRate: 68,
    redemptionRate: 24,
    revenueGenerated: 840000,
  },
  {
    id: '2',
    name: 'Gold Customer Rewards',
    type: 'loyalty',
    status: 'active',
    openRate: 82,
    redemptionRate: 45,
    revenueGenerated: 1250000,
  },
  {
    id: '3',
    name: 'Win Back Inactive',
    type: 'reengagement',
    status: 'active',
    openRate: 54,
    redemptionRate: 18,
    revenueGenerated: 320000,
  },
  {
    id: '4',
    name: 'Birthday Special',
    type: 'birthday',
    status: 'paused',
    openRate: 91,
    redemptionRate: 62,
    revenueGenerated: 480000,
  },
  {
    id: '5',
    name: 'Rainy Season Promo',
    type: 'seasonal',
    status: 'completed',
    openRate: 72,
    redemptionRate: 35,
    revenueGenerated: 960000,
  },
]

export const notifications: Notification[] = [
  {
    id: '1',
    title: 'Payment received',
    message: 'John paid ₦25,000 debt installment.',
    time: '5 min ago',
    type: 'payment',
    read: false,
  },
  {
    id: '2',
    title: 'Customer retention',
    message: '5 customers returned this week after your re-engagement campaign.',
    time: '1 hour ago',
    type: 'customer',
    read: false,
  },
  {
    id: '3',
    title: 'Revenue milestone',
    message: 'Revenue increased by 18% compared to last month.',
    time: '3 hours ago',
    type: 'growth',
    read: true,
  },
  {
    id: '4',
    title: 'Low inventory',
    message: 'Tomato Paste stock is running low — only 8 units left.',
    time: '5 hours ago',
    type: 'inventory',
    read: true,
  },
  {
    id: '5',
    title: 'AI discovery',
    message: 'AI discovered a new sales trend: evening purchases up 22% on Fridays.',
    time: 'Yesterday',
    type: 'ai',
    read: true,
  },
]

export const aiSuggestedQuestions = [
  'What sold most this week?',
  'Why are sales down?',
  'Who spends the most?',
  'What products should I restock?',
  'Which customers are at risk of churning?',
]

export const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hello Daniel! 👋 I'm your CashFlow AI assistant. I can help you understand your sales, customers, debts, and growth opportunities. What would you like to know?",
    timestamp: '9:00 AM',
  },
]

export const aiResponses: Record<string, { content: string; actions?: string[] }> = {
  'what sold most this week?': {
    content:
      '**Rice 50kg** is your top seller this week with **847 units** sold, generating **₦2.84M** in revenue. It accounts for 34% of total sales.\n\nVegetable Oil 5L follows at 412 units. I recommend bundling these two products for a 15% average order value uplift.',
    actions: ['Create Coupon', 'View Product', 'Export Report'],
  },
  'why are sales down?': {
    content:
      'Sales are down **14%** this week, primarily due to:\n\n• Reduced evening purchases (6PM–9PM) — down 22%\n• Tuesday 2PM–5PM remains your slowest window\n• Palm Oil 5L underperforming by 14%\n\nRecommendation: Launch an evening flash sale and a Tuesday afternoon promotion.',
    actions: ['Create Coupon', 'View Analysis', 'Send Campaign'],
  },
  'who spends the most?': {
    content:
      'Your top spenders this month:\n\n1. **Adaeze Okonkwo** — ₦1.24M (Gold tier)\n2. **Chidi Eze** — ₦980K (Gold tier)\n3. **Fatima Bello** — ₦540K (Silver tier)\n\nGold customers represent 62% of revenue. Consider a VIP loyalty program.',
    actions: ['View Customer', 'Send Promotion', 'Create Coupon'],
  },
  'what products should i restock?': {
    content:
      'Priority restock list:\n\n🔴 **Tomato Paste** — 8 units left (critical)\n🟡 **Rice 50kg** — 42 units (5 days until stockout)\n🟢 **Vegetable Oil 5L** — 68 units (healthy)\n\nBased on sales velocity, order 200 units of Tomato Paste and 150 units of Rice 50kg.',
    actions: ['View Product', 'Export Report', 'Create Coupon'],
  },
  default: {
    content:
      "Based on your business data, I can see strong weekend performance and healthy customer retention. Your business health score of **87/100** puts you ahead of 78% of similar merchants.\n\nWould you like me to dive deeper into revenue, customers, or product performance?",
    actions: ['View Analysis', 'Export Report', 'Create Coupon'],
  },
}

export const suggestedPrompts = [
  DollarSign,
  TrendingUp,
  Users,
  Package,
]
