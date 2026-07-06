/**
 * Groq AI service — sends the full platform context (business data, transactions,
 * customers, debts, products, KPIs) with every message so the AI knows everything
 * about the merchant's business and can answer any question intelligently.
 */

import {
  customers,
  debts,
  products,
  kpis,
  revenueChartData,
  merchant,
  businessHealth,
} from '../../data/mockData'
import type { NombaTransaction } from '../nomba/api'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export type AIMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/** Build a rich system prompt with all platform data so the AI can answer anything */
function buildSystemPrompt(liveTransactions?: NombaTransaction[]): string {
  const kpiSummary = kpis
    .map((k) => `- ${k.label}: ${k.value} (${k.change >= 0 ? '+' : ''}${k.change}% ${k.changeLabel})`)
    .join('\n')

  const productSummary = products
    .map((p) => `- ${p.name}: ₦${p.revenue.toLocaleString()} revenue, ${p.unitsSold} units sold, ${p.stockLevel} in stock, status: ${p.status}${p.aiRecommendation ? ` → ${p.aiRecommendation}` : ''}`)
    .join('\n')

  const customerSummary = customers
    .map((c) => `- ${c.name} (${c.tier} tier): ₦${c.totalSpend.toLocaleString()} total spend, health score ${c.healthScore}/100, last purchase ${c.lastPurchase}`)
    .join('\n')

  const debtSummary = debts
    .map((d) => `- ${d.customerName}: ₦${d.amount.toLocaleString()}, due ${d.dueDate}, status: ${d.category}, ${d.installmentProgress}% paid`)
    .join('\n')

  const revenueSummary = revenueChartData
    .map((d) => `- ${d.name}: ₦${d.revenue.toLocaleString()} revenue, ${d.sales} sales, ${d.customers} customers`)
    .join('\n')

  const totalDebt = debts.filter(d => d.category !== 'paid').reduce((s, d) => s + d.amount, 0)
  const overdueDebt = debts.filter(d => d.category === 'overdue').reduce((s, d) => s + d.amount, 0)

  let liveSection = ''
  if (liveTransactions && liveTransactions.length > 0) {
    const successTxns = liveTransactions.filter(t => t.status === 'SUCCESS')
    const totalLive = successTxns.reduce((s, t) => s + t.amount, 0)
    const recent = liveTransactions.slice(0, 5).map(t =>
      `- ${t.type} | ₦${t.amount.toLocaleString()} | ${t.status} | ${new Date(t.timeCreated).toLocaleDateString()}`
    ).join('\n')
    liveSection = `
## LIVE NOMBA TRANSACTION DATA (Real-time)
- Total successful transactions: ${successTxns.length}
- Total live revenue: ₦${totalLive.toLocaleString()}
Recent transactions:
${recent}
`
  }

  return `You are CashFlow AI, an intelligent business assistant for Nigerian merchants built into the CashFlow AI platform. You have complete access to the merchant's business data and can answer any question about their performance, customers, products, debts, and financial health.

## MERCHANT INFO
- Business Name: ${merchant.name}
- Owner: ${merchant.owner}
- Business Health Score: ${businessHealth.score}/100 (better than ${businessHealth.percentile}% of similar merchants)

## KEY PERFORMANCE INDICATORS
${kpiSummary}

## REVENUE DATA (Last 7 days)
${revenueSummary}

## PRODUCTS
${productSummary}

## CUSTOMERS
${customerSummary}

## DEBTS
- Total outstanding: ₦${totalDebt.toLocaleString()}
- Overdue: ₦${overdueDebt.toLocaleString()}
${debtSummary}
${liveSection}

## YOUR ROLE
- Answer questions about sales, revenue, products, customers, debts, and business performance
- Give actionable, specific recommendations based on the data above
- Speak in a friendly, direct tone — like a smart business advisor
- Use Nigerian Naira (₦) for all currency amounts
- Keep responses concise but complete
- When you spot risks or opportunities in the data, proactively mention them
- Format numbers clearly (e.g. ₦1.2M, not ₦1200000)
- You can analyze trends, compare periods, identify top/bottom performers, and suggest strategies

Always base your answers on the actual data provided above. Never make up numbers.`
}

/** Send a message to Groq and stream back the response */
export async function sendToGroq(
  messages: AIMessage[],
  liveTransactions?: NombaTransaction[],
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string

  if (!apiKey) {
    throw new Error('Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.')
  }

  const systemPrompt = buildSystemPrompt(liveTransactions)

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
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ??
        `Groq API error ${response.status}`,
    )
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[]
  }

  return data.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.'
}
