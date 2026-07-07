import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase/client'

export type Product = {
  id: string
  name: string
  description: string
  category: string
  price: number
  costPrice: number
  stockLevel: number
  unitsSold: number
  imageUrl: string
  status: 'active' | 'low-stock' | 'out-of-stock'
  createdAt: string
}

const LOCAL_KEY = 'cashflow-merchant-id'

function getMerchantId(accountId?: string): string {
  if (accountId && accountId !== 'demo') return accountId
  let id = localStorage.getItem(LOCAL_KEY)
  if (!id) { id = `local_${Date.now()}`; localStorage.setItem(LOCAL_KEY, id) }
  return id
}

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    category: (row.category as string) ?? 'General',
    price: Number(row.price ?? 0),
    costPrice: Number(row.cost_price ?? 0),
    stockLevel: Number(row.stock_level ?? 0),
    unitsSold: Number(row.units_sold ?? 0),
    imageUrl: (row.image_url as string) ?? '',
    status: (row.status as Product['status']) ?? 'active',
    createdAt: row.created_at as string,
  }
}

function deriveStatus(stock: number): Product['status'] {
  if (stock === 0) return 'out-of-stock'
  if (stock <= 10) return 'low-stock'
  return 'active'
}

export function useProducts(accountId?: string) {
  const mid = getMerchantId(accountId)
  const midRef = useRef(mid)
  midRef.current = mid

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    setLoading(true)

    supabase
      .from('products')
      .select('*')
      .eq('merchant_account_id', midRef.current)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }: { data: any; error: any }) => {
        if (err) {
          console.error('[useProducts] Load error:', err.message)
          setError(err.message)
        } else {
          setProducts(data?.map(toProduct) ?? [])
        }
        setLoading(false)
      })
  }, [])

  const addProduct = useCallback(async (input: Omit<Product, 'id' | 'createdAt' | 'status'>) => {
    const status = deriveStatus(input.stockLevel)
    const tempId = `temp_${Date.now()}`
    const optimistic: Product = { ...input, id: tempId, status, createdAt: new Date().toISOString() }
    setProducts(prev => [optimistic, ...prev])
    setError(null)

    const { data, error: err } = await supabase
      .from('products')
      .insert({
        merchant_account_id: midRef.current,
        name: input.name,
        description: input.description,
        category: input.category,
        price: input.price,
        cost_price: input.costPrice,
        stock_level: input.stockLevel,
        units_sold: input.unitsSold,
        image_url: input.imageUrl,
        status,
      })
      .select()
      .single()

    if (err) {
      console.error('[useProducts] Insert error:', err.message)
      setError(`Save failed: ${err.message}`)
      setProducts(prev => prev.filter(p => p.id !== tempId))
    } else if (data) {
      setProducts(prev => prev.map(p => p.id === tempId ? toProduct(data) : p))
    }
  }, [])

  const updateProduct = useCallback(async (id: string, changes: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))

    const dbChanges: Record<string, unknown> = {}
    if (changes.name !== undefined) dbChanges.name = changes.name
    if (changes.description !== undefined) dbChanges.description = changes.description
    if (changes.category !== undefined) dbChanges.category = changes.category
    if (changes.price !== undefined) dbChanges.price = changes.price
    if (changes.costPrice !== undefined) dbChanges.cost_price = changes.costPrice
    if (changes.stockLevel !== undefined) {
      dbChanges.stock_level = changes.stockLevel
      dbChanges.status = deriveStatus(changes.stockLevel)
    }
    if (changes.unitsSold !== undefined) dbChanges.units_sold = changes.unitsSold
    if (changes.imageUrl !== undefined) dbChanges.image_url = changes.imageUrl

    const { error: err } = await supabase.from('products').update(dbChanges).eq('id', id)
    if (err) console.error('[useProducts] Update error:', err.message)
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    const { error: err } = await supabase.from('products').delete().eq('id', id)
    if (err) console.error('[useProducts] Delete error:', err.message)
  }, [])

  return { products, loading, error, addProduct, updateProduct, deleteProduct }
}
