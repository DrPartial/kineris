'use client'

import { Modal } from './Modal'
import { Tabs } from './Tabs'
import { CreateAccountForm } from './forms/CreateAccountForm'
import { SignInForm } from './forms/SignInForm'
import { useOverlay } from '@/contexts/OverlayContext'

export function AccountModal() {
  const { openOverlay, setOpenOverlay } = useOverlay()
  const open = openOverlay === 'account'

  function close() {
    setOpenOverlay(null)
  }

  return (
    <Modal open={open} onClose={close} label="Sign in or create an account">
      <div className="w-[min(90vw,24rem)] rounded-md border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Your account</h2>
          <button type="button" onClick={close} aria-label="Close" className="text-ink-hint hover:text-ink">
            &times;
          </button>
        </div>
        <Tabs
          items={[
            { id: 'sign-in', label: 'Sign in', content: <SignInForm onSuccess={close} /> },
            { id: 'create-account', label: 'Create account', content: <CreateAccountForm onSuccess={close} /> },
          ]}
        />
      </div>
    </Modal>
  )
}
