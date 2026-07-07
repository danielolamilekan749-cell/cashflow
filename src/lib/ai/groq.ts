/**
 * Groq AI service — builds a system prompt from LIVE platform data.
 * No mock "Daniel" names — uses real account info when connected.
 */

import { customers, debts, products, kpis, revenueChartData } from '../../data/mockData'
import type { NombaTransaction } from '../nomba/api'
import type { MerchantInfo } from '../../hooks/useMerchant'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export type AIMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type GroqContext = {
  merchant?: MerchantInfo
  liveTransactions?: NombaTransaction[]
  liveBalance?: number
}

function buildSystemPrompt(ctx: GroqContext): string {
  const m = ctx.merchant
  const txns = ctx.liveTransactions ?? []
  const successTxns = txns.filter(t => t.status === 'SUCCESS')

  // Merchant identity — use real data if available, generic if demo
  const businessName = m?.name ?? 'the merchant'
  const ownerName = m?.owner ?? 'Merchant'
  const mode = m?.isSandbox ? 'Nomba sandbox' : m?.isLive ? 'Nomba live' : 'demo'

  // Build live transaction summary if available
  let dataSection = ''
  if (successTxns.length > 0) {
    const totalRevenue = successTxns.reduce((s, t) => s + t.amount, 0)
    const today = new Date().toDateString()
    const todayTxns = successTxns.filter(t => new Date(t.timeCreated).toDateString() === today)
    const todayRevenue = todayTxns.reduce((s, t) => s + t.amount, 0)
    const avgTxn = totalRevenue / successTxns.length

    const typeBreakdown = successTxns.reduce<Record<string, number>>((acc, t) => {
      acc[t.type] = (acc[t.type] ?? 0) + t.amount
      return acc
    }, {})

    const recentTxns = txns.slice(0, 8).map(t =>
      `- ₦${t.amount.toLocaleString()} | ${t.type} | ${t.status} | ${new Date(t.timeCreated).toLocaleDateString('en-NG')}`
    ).join('\n')

    dataSection = `
## LIVE NOMBA DATA (${mode})
- Total transactions loaded: ${txns.length} (${successTxns.length} successful)
- Total revenue from loaded data: ₦${totalRevenue.toLocaleString()}
- Today's revenue: ₦${todayRevenue.toLocaleString()} (${todayTxns.length} transactions)
- Average transaction value: ₦${Math.round(avgTxn).toLocaleString()}
${ctx.liveBalance !== undefined ? `- Current account balance: ₦${ctx.liveBalance.toLocaleString()}` : ''}
- Revenue by type: ${Object.entries(typeBreakdown).map(([k, v]) => `${k}: ₦${v.toLocaleString()}`).join(', ')}

Recent transactions:
${recentTxns}
`
  } else {
    // Fall back to mock data for context when no live data
    const kpiSummary = kpis.slice(0, 5)
      .map(k => `- ${k.label}: ${k.value} (${k.change >= 0 ? '+' : ''}${k.change}% ${k.changeLabel})`)
      .join('\n')

    const productSummary = products
      .map(p => `- ${p.name}: ₦${p.revenue.toLocaleString()}, ${p.unitsSold} units, ${p.stockLevel} in stock`)
      .join('\n')

    const debtTotal = debts.filter(d => d.category !== 'paid').reduce((s, d) => s + d.amount, 0)
    const overdueTotal = debts.filter(d => d.category === 'overdue').reduce((s, d) => s + d.amount, 0)

    const revenueSummary = revenueChartData
      .map(d => `- ${d.name}: ₦${d.revenue.toLocaleString()}, ${d.sales} sales`)
      .join('\n')

    dataSection = `
## SAMPLE BUSINESS DATA (Demo mode — connect Nomba for real data)
### KPIs
${kpiSummary}

### Revenue (Last 7 days)
${revenueSummary}

### Top Products
${productSummary}

### Debts
- Total outstanding: ₦${debtTotal.toLocaleString()}
- Overdue: ₦${overdueTotal.toLocaleString()}

### Customers (sample)
${customers.slice(0, 4).map(c => `- ${c.name} (${c.tier}): ₦${c.totalSpend.toLocaleString()} spend, health ${c.healthScore}/100`).join('\n')}
`
  }

  return `You are CashFlow AI, an intelligent business assistant for Nigerian merchants on the CashFlow AI platform.

## MERCHANT
- Business: ${businessName}
- Owner: ${ownerName}
- Connection: ${mode}
- Account ID: ${m?.accountId || 'not connected'}
${dataSection}

## YOUR ROLE
- Answer questions about sales, revenue, transactions, debts, customers, and business performance
- Give specific, actionable recommendations based on the data above
- Speak like a smart, friendly business advisor — direct and concise
- Use Nigerian Naira (₦) for all money values
- Format large numbers clearly: ₦1.2M not ₦1200000
- If asked about something not in the data, say so honestly
- When in demo mode, remind the merchant to connect Nomba for real insights
- When in sandbox/live mode, always reference the actual data you have

Never make up numbers that aren't in the data above.`
}

export async function sendToGroq(
  messages: AIMessage[],
  ctx: GroqContext = {},
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string

  if (!apiKey) {
    return 'Groq AI is not configured yet. Add VITE_GROQ_API_KEY to your .env file!'
  }

  const systemPrompt = buildSystemPrompt(ctx)

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const errorMsg = (err as { error?: { message?: string } }).error?.message ?? `Groq API error ${response.status}`
      console.error('[Groq]', errorMsg)
      return `Oops! Something went wrong with Groq AI: ${errorMsg}`
    }

    const data = await response.json() as { choices: { message: { content: string } }[] }
    return data.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.'
  } catch (e) {
    console.error('[Groq]', e)
    return 'Sorry, I could not reach Groq AI. Please try again later!'
  }
}
