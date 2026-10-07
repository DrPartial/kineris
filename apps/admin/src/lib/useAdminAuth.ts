'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api, ApiError } from './api.ts'

interface AdminMe {
  id: string
  email: string
}

/**
 * Every protected page calls this and renders nothing until it resolves.
 * Redirects to /login on a 401 rather than rendering an empty authenticated
 * shell that would flash real data before the redirect lands.
 */
export function useAdminAuth(): AdminMe | null {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminMe | null>(null)

  useEffect(() => {
    api<AdminMe>('/api/admin/auth/me')
      .then(setAdmin)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
      })
  }, [router])

  return admin
}
