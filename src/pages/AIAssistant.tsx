import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Bot, RefreshCw, Send, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { sendToGroq, type AIMessage } from '../lib/ai/groq'
import { useNombaData } from '../hooks/useNombaData'
import { useMerchant } from '../hooks/useMerchant'
import type { ChatMessage } from '../types'

const SUGGESTED = [
  "What's my revenue this week?",
  'Which products should I restock?',
  'Who are my top customers?',
  'How much debt is overdue?',
  'Why are my sales down?',
  'What should I focus on today?',
]

function formatContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function AIAssistant() {
  const merchant = useMerchant()
  const nomba = useNombaData()

  const liveBalance = nomba.balance ? parseFloat(nomba.balance.amount) : undefined

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: merchant.isDemo
        ? `Hello! 👋 I'm CashFlow AI, powered by Groq.\n\nYou're in **demo mode** — I'm using sample data. Connect your Nomba account for real, live answers about your actual business.\n\nTry asking me something!`
        : `Hello, ${merchant.owner}! 👋 I'm CashFlow AI, powered by Groq.\n\nConnected to your **${merchant.isSandbox ? 'Nomba sandbox' : 'Nomba live'}** account (${merchant.name}). I have your real transaction data — ${nomba.transactions.length} transactions loaded. Ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<AIMessage[]>([])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setError(null)

    historyRef.current = [
      ...historyRef.current.slice(-18),
      { role: 'user', content: text.trim() },
    ]

    try {
      const reply = await sendToGroq(historyRef.current, {
        merchant,
        liveTransactions: nomba.transactions.length > 0 ? nomba.transactions : undefined,
        liveBalance,
      })

      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }]

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      setMessages((prev) => prev.slice(0, -1))
      historyRef.current = historyRef.current.slice(0, -1)
      setInput(text)
    } finally {
      setTyping(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    historyRef.current = []
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Chat cleared! Still have access to all your data. What would you like to know?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setError(null)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:h-[calc(100vh-6rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-yellow shadow-sm">
            <Bot className="h-6 w-6 text-ink-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-black">AI Business Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
              <p className="text-xs text-ink-muted">
                {merchant.isDemo
                  ? 'Demo mode — sample data'
                  : `${merchant.isSandbox ? 'Sandbox' : 'Live'} · ${nomba.transactions.length} transactions`}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <div className="card-base flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 lg:max-w-[72%] ${
                    msg.role === 'user'
                      ? 'bg-ink-black text-white'
                      : 'border border-gray-100 bg-surface-off'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-brand-yellow-dark" />
                      <span className="text-xs font-semibold text-brand-yellow-dark">CashFlow AI</span>
                    </div>
                  )}
                  <div
                    className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-ink-charcoal'}`}
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                  <p className={`mt-1.5 text-[10px] ${msg.role === 'user' ? 'text-white/50' : 'text-ink-light'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="rounded-2xl border border-gray-100 bg-surface-off px-4 py-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-yellow-dark" />
                  <span className="text-xs font-semibold text-brand-yellow-dark">CashFlow AI</span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-brand-yellow"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 rounded-xl border border-status-danger/20 bg-status-danger-soft px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-danger" />
              <div>
                <p className="text-xs font-semibold text-status-danger">Couldn't reach AI</p>
                <p className="text-xs text-ink-charcoal">{error}</p>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={typing}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-brand-yellow/40 hover:bg-brand-yellow/5 hover:text-ink-charcoal disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your business..."
              className="input-base flex-1"
              disabled={typing}
            />
            <button type="submit" disabled={typing || !input.trim()} className="btn-primary shrink-0 px-4 disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
