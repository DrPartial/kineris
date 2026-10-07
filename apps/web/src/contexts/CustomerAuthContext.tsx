'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '@/lib/api'

interface Customer {
  id: string
  email: string
}

interface CustomerAuthValue {
  customer: Customer | null | 'loading'
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthValue | null>(null)

/**
 * Fetches /api/auth/me once and shares it, instead of every page/component
 * that needs to know "is someone signed in" (header, bottom nav, drawer,
 * account modal, account pages) each calling it independently.
 */
export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null | 'loading'>('loading')

  const refresh = useCallback(async () => {
    try {
      const me = await api<Customer>('/api/auth/me')
      setCustomer(me)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setCustomer(null)
      else setCustomer(null)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function signOut() {
    await api('/api/auth/log-out', { method: 'POST' })
    setCustomer(null)
  }

  return <CustomerAuthContext.Provider value={{ customer, refresh, signOut }}>{children}</CustomerAuthContext.Provider>
}

export function useCustomerAuth(): CustomerAuthValue {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  return ctx
}
