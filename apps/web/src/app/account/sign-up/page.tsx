'use client'

import { useRouter } from 'next/navigation'
import { CreateAccountForm } from '@/components/forms/CreateAccountForm'

export default function SignUpPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create an account</h1>
      <div className="mt-6">
        <CreateAccountForm onSuccess={() => router.push('/account')} />
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        Already have an account?{' '}
        <a href="/account/sign-in" className="text-accent hover:text-accent-hover">
          Sign in
        </a>
      </p>
    </div>
  )
}
