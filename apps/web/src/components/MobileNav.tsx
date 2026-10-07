'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { useOverlay } from '@/contexts/OverlayContext'

const ICONS = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-4.3-4.3" />,
  box: <path d="M3 7l9-4 9 4-9 4-9-4ZM3 7v10l9 4M21 7v10l-9 4M3 7l9 4 9-4" />,
  chat: <path d="M4 4h16v12H8l-4 4V4Z" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0" />,
} as const

export function MobileNav() {
  const pathname = usePathname()
  const { setOpenOverlay } = useOverlay()
  const { customer } = useCustomerAuth()

  const items: { key: string; label: string; icon: keyof typeof ICONS; onClick?: () => void; href?: string }[] = [
    { key: 'menu', label: 'Menu', icon: 'menu', onClick: () => setOpenOverlay('drawer') },
    { key: 'search', label: 'Search', icon: 'search', onClick: () => setOpenOverlay('search') },
    {
      key: 'order-status',
      label: 'Order Status',
      icon: 'box',
      href: customer && customer !== 'loading' ? '/account/orders' : '/order-status',
    },
    { key: 'contact', label: 'Contact Us', icon: 'chat', href: '/contact' },
    {
      key: 'account',
      label: 'Account',
      icon: 'user',
      ...(customer && customer !== 'loading' ? { href: '/account' } : { onClick: () => setOpenOverlay('account') }),
    },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      {items.map((item) => {
        const active = item.href && pathname === item.href
        const className = `flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium no-underline ${
          active ? 'text-accent' : 'text-ink-muted'
        }`
        const content = (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              {ICONS[item.icon]}
            </svg>
            <span className="w-full truncate text-center leading-tight">{item.label}</span>
          </>
        )
        return item.href ? (
          <Link key={item.key} href={item.href} className={className}>
            {content}
          </Link>
        ) : (
          <button key={item.key} type="button" onClick={item.onClick} className={className}>
            {content}
          </button>
        )
      })}
    </nav>
  )
}
