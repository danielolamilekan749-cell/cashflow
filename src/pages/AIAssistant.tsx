import { motion } from 'framer-motion'
import { Bot, Send, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  aiResponses,
  aiSuggestedQuestions,
  initialChatMessages,
} from '../data/mockData'
import type { ChatMessage } from '../types'

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const key = text.trim().toLowerCase()
      const response = aiResponses[key] ?? aiResponses.default
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions,
      }
      setMessages((prev) => [...prev, aiMsg])
      setTyping(false)
    }, 1200)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:h-[calc(100vh-10rem)]">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-yellow shadow-sm">
            <Bot className="h-6 w-6 text-ink-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-black">AI Business Assistant</h1>
            <p className="text-sm text-ink-muted">
              Ask anything about your business — powered by CashFlow AI
            </p>
          </div>
        </div>
      </div>

      <div className="card-base flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 lg:max-w-[70%] ${
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
                  className={`whitespace-pre-line text-sm leading-relaxed ${
                    msg.role === 'user' ? 'text-white' : 'text-ink-charcoal'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
                {msg.actions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.actions.map((action) => (
                      <button
                        key={action}
                        className="rounded-lg bg-brand-yellow/20 px-3 py-1.5 text-xs font-semibold text-ink-black transition-colors hover:bg-brand-yellow/40"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
                <p className={`mt-1.5 text-[10px] ${msg.role === 'user' ? 'text-white/50' : 'text-ink-light'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-gray-100 bg-surface-off px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-brand-yellow"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {aiSuggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-brand-yellow/40 hover:bg-brand-yellow/5 hover:text-ink-charcoal"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage(input)
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask CashFlow AI anything..."
              className="input-base flex-1"
            />
            <button type="submit" className="btn-primary shrink-0 px-4">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
