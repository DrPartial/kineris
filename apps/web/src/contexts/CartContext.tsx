'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface CartLine {
  variantId: string
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  addLine: (variantId: string, quantity?: number) => void
  removeLine: (variantId: string) => void
  setQuantity: (variantId: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'kineris_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)

  // localStorage isn't available during SSR, and reading it before the
  // client mount would desync the server/client render, so load once, after
  // mount, same reasoning as any client-only persisted state.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setLines(JSON.parse(raw))
    } catch {
      // Corrupt or inaccessible storage: start from an empty cart rather than throwing.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Private browsing or full storage: the cart just stays in-memory for this tab.
    }
  }, [lines, hydrated])

  function addLine(variantId: string, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === variantId)
      if (existing) {
        return prev.map((l) => (l.variantId === variantId ? { ...l, quantity: l.quantity + quantity } : l))
      }
      return [...prev, { variantId, quantity }]
    })
  }

  function removeLine(variantId: string) {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId))
  }

  function setQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) return removeLine(variantId)
    setLines((prev) => prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)))
  }

  function clear() {
    setLines([])
  }

  return (
    <CartContext.Provider value={{ lines, addLine, removeLine, setQuantity, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
