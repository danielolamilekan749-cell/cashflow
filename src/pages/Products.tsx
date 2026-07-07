import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Bot,
  Edit3,
  Image as ImageIcon,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { sendToGroq } from '../lib/ai/groq'
import { useProducts, type Product } from '../hooks/useProducts'
import { formatCurrency, formatCompact } from '../utils/format'

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
  'active':       { label: 'In Stock',     color: 'bg-status-success-soft text-status-success' },
  'low-stock':    { label: 'Low Stock',    color: 'bg-status-warning-soft text-status-warning' },
  'out-of-stock': { label: 'Out of Stock', color: 'bg-status-danger-soft text-status-danger' },
}

const CATEGORIES = ['General', 'Food & Drinks', 'Electronics', 'Clothing', 'Home & Garden', 'Health & Beauty', 'Other']

const emptyForm = {
  name: '', description: '', category: 'General',
  price: '', costPrice: '', stockLevel: '', unitsSold: '', imageUrl: '',
}

// ─── AI Prediction badge ──────────────────────────────────────────────────────
type Prediction = { rank: number; label: string; insight: string; reorderQty: number }

// ─── Add / Edit modal ─────────────────────────────────────────────────────────
function ProductModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Product | null
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'status'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          description: initial.description,
          category: initial.category,
          price: String(initial.price),
          costPrice: String(initial.costPrice),
          stockLevel: String(initial.stockLevel),
          unitsSold: String(initial.unitsSold),
          imageUrl: initial.imageUrl,
        }
      : emptyForm,
  )
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  const askAI = async () => {
    if (!form.name.trim()) return
    setAiLoading(true)
    setShowAI(true)
    try {
      const prompt = `A Nigerian merchant wants to add a new product: "${form.name}" in the "${form.category}" category. Price: ₦${form.price || 'not set'}. Give 2-3 sentences of specific business insight: Is this a good product to stock? What price is competitive? What quantity should they start with? Be direct and use Nigerian market context.`
      const reply = await sendToGroq([{ role: 'user', content: prompt }])
      setAiInsight(reply)
    } catch {
      setAiInsight('Could not reach AI. Please try again.')
    }
    setAiLoading(false)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.price) return
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      costPrice: Number(form.costPrice || 0),
      stockLevel: Number(form.stockLevel || 0),
      unitsSold: Number(form.unitsSold || 0),
      imageUrl: form.imageUrl.trim(),
    })
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-ink-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 28 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="fixed left-4 right-4 top-[4%] z-[71] mx-auto max-w-lg overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl sm:top-[6%]"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-ink-black">{initial ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs text-ink-muted">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-light hover:bg-surface-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Image URL */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Product Image URL (optional)</label>
            <div className="flex gap-2">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted">
                  <ImageIcon className="h-4 w-4 text-ink-light" />
                </div>
              )}
              <input type="url" placeholder="https://..." value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)} className="input-base flex-1 text-sm" />
            </div>
          </div>

          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Product Name *</label>
              <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Rice 50kg" className="input-base" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Category</label>
              <select value={form.category} onChange={e => f('category', e.target.value)} className="input-base">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Description</label>
              <input value={form.description} onChange={e => f('description', e.target.value)} placeholder="Optional" className="input-base" />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Selling Price (₦) *</label>
              <input type="number" min="0" value={form.price} onChange={e => f('price', e.target.value)} placeholder="e.g. 45000" className="input-base" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Cost Price (₦)</label>
              <input type="number" min="0" value={form.costPrice} onChange={e => f('costPrice', e.target.value)} placeholder="e.g. 38000" className="input-base" />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Stock Level</label>
              <input type="number" min="0" value={form.stockLevel} onChange={e => f('stockLevel', e.target.value)} placeholder="e.g. 50" className="input-base" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Units Sold (total)</label>
              <input type="number" min="0" value={form.unitsSold} onChange={e => f('unitsSold', e.target.value)} placeholder="e.g. 120" className="input-base" />
            </div>
          </div>

          {/* Ask AI */}
          <button
            type="button"
            onClick={askAI}
            disabled={!form.name.trim() || aiLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-yellow/30 bg-brand-yellow/8 py-2.5 text-xs font-semibold text-ink-charcoal transition-colors hover:bg-brand-yellow/15 disabled:opacity-50"
          >
            <Bot className={`h-4 w-4 text-brand-yellow-dark ${aiLoading ? 'animate-pulse' : ''}`} />
            {aiLoading ? 'Getting AI insight...' : 'Ask AI for business insight'}
          </button>

          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-brand-yellow/20 bg-brand-yellow/8 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand-yellow-dark" />
                    <span className="text-xs font-bold text-brand-yellow-dark">AI Business Insight</span>
                  </div>
                  {aiLoading ? (
                    <div className="flex gap-1 py-1">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-brand-yellow"
                          animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-ink-charcoal"
                      dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || !form.price}
            className="btn-primary flex-1 text-sm disabled:opacity-50"
          >
            {initial ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    const aStock = a.stockLevel
    const bStock = b.stockLevel
    if (aStock === 0 && bStock > 0) return -1
    if (bStock === 0 && aStock > 0) return 1
    if (aStock < 5 && bStock >= 5) return -1
    if (bStock < 5 && aStock >= 5) return 1
    return 0
  })

  const generatePredictions = async () => {
    if (!products.length) return
    setShowPredictions(true)
    setPredictions([])
    
    await new Promise(r => setTimeout(r, 600))
    
    const bySold = [...products].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5)
    
    const newPredictions: Prediction[] = bySold.map((p, i) => ({
      rank: i + 1,
      label: p.name,
      insight: i === 0 
        ? `Best seller! Reorder ${Math.max(20, p.unitsSold)} units to meet demand.`
        : i === 1
        ? `Strong performer. Consider increasing price slightly or ordering more.`
        : `Good moving item. Keep ${Math.max(10, p.stockLevel)} in stock.`,
      reorderQty: Math.max(10, Math.round(p.unitsSold * 0.5)),
    }))
    
    setPredictions(newPredictions)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-black">Products</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your inventory and track sales performance
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={generatePredictions} className="btn-secondary flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </button>
          <button onClick={() => { setEditingProduct(null); setShowModal(true) }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* AI Predictions */}
      {showPredictions && predictions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="card-base p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-yellow/10">
                <Sparkles className="h-4 w-4 text-brand-yellow-dark" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink-black">AI Inventory Recommendations</h3>
                <p className="text-xs text-ink-muted">Smart reorder suggestions based on sales</p>
              </div>
            </div>
            <button onClick={() => setShowPredictions(false)} className="text-xs text-ink-muted hover:text-ink-black">
              Hide
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {predictions.map((pred) => (
              <div key={pred.label} className="rounded-xl border border-gray-100 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow/10 text-xs font-bold text-brand-yellow-dark">
                    #{pred.rank}
                  </div>
                  <span className="text-sm font-semibold text-ink-black truncate flex-1">{pred.label}</span>
                </div>
                <p className="text-xs text-ink-muted mb-2">{pred.insight}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-muted">Suggested reorder</span>
                  <span className="text-xs font-bold text-status-success">+{pred.reorderQty} units</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Total Products</p>
              <p className="text-xl font-bold text-ink-black">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-warning-soft">
              <AlertTriangle className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Low Stock</p>
              <p className="text-xl font-bold text-ink-black">
                {products.filter(p => p.stockLevel < 10).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-success-soft">
              <TrendingUp className="h-5 w-5 text-status-success" />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Total Units Sold</p>
              <p className="text-xl font-bold text-ink-black">
                {formatCompact(products.reduce((a, b) => a + b.unitsSold, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-base pl-11"
        />
      </div>

      {/* Products Grid */}
      {sorted.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center py-12">
          <Package className="mb-3 h-10 w-10 text-ink-light" />
          <h3 className="text-sm font-semibold text-ink-black">No products yet</h3>
          <p className="text-xs text-ink-muted mb-4">Add your first product to get started</p>
          <button onClick={() => { setEditingProduct(null); setShowModal(true) }} className="btn-primary text-sm">
            Add Product
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base group relative overflow-hidden"
            >
              {product.imageUrl && (
                <div className="absolute inset-0 opacity-5">
                  <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="relative flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-ink-black">{product.name}</h3>
                    <p className="mt-0.5 text-xs text-ink-muted">{product.category}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusConfig[product.status].color}`}>
                    {statusConfig[product.status].label}
                  </span>
                </div>

                {product.description && (
                  <p className="text-xs text-ink-muted line-clamp-2">{product.description}</p>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-surface-off p-2">
                    <p className="text-[10px] text-ink-muted">Price</p>
                    <p className="text-xs font-bold text-ink-black">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="rounded-lg bg-surface-off p-2">
                    <p className="text-[10px] text-ink-muted">Stock</p>
                    <p className={`text-xs font-bold ${product.stockLevel < 10 ? 'text-status-warning' : 'text-ink-black'}`}>
                      {product.stockLevel}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-off p-2">
                    <p className="text-[10px] text-ink-muted">Sold</p>
                    <p className="text-xs font-bold text-ink-black">{product.unitsSold}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingProduct(product); setShowModal(true) }}
                    className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs py-2"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-ink-muted hover:border-status-danger/30 hover:text-status-danger hover:bg-status-danger-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ProductModal
            initial={editingProduct}
            onSave={(data) => {
              if (editingProduct) {
                updateProduct(editingProduct.id, data)
              } else {
                addProduct(data)
              }
            }}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
