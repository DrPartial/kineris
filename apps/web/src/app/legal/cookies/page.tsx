import Link from 'next/link'
import { LegalPageShell } from '@/components/LegalPageShell'

export default function CookiesPage() {
  return (
    <LegalPageShell title="Cookie Policy">
      <p>
        <strong className="text-ink">Essential cookies</strong> keep your basket and checkout working. The site will not
        work properly without them.
      </p>
      <p>
        <strong className="text-ink">Analytics cookies</strong> help us understand how the site is used, in aggregate
        only. You can switch them off in our cookie banner at any time.
      </p>
      <p>
        <strong className="text-ink">Marketing cookies</strong> (such as advertising pixels) are only set if you accept
        them in the cookie banner.
      </p>
      <p>
        See our{' '}
        <Link href="/legal/privacy" className="text-accent hover:text-accent-hover">
          Privacy Policy
        </Link>{' '}
        for how we use personal data.
      </p>
    </LegalPageShell>
  )
}
