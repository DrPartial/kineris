'use client'

import { useRouter } from 'next/navigation'
import { SignInForm } from '@/components/forms/SignInForm'

export default function SignInPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
      <div className="mt-6">
        <SignInForm onSuccess={() => router.push('/account')} />
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        No account?{' '}
        <a href="/account/sign-up" className="text-accent hover:text-accent-hover">
          Create one
        </a>
      </p>
    </div>
  )
}
