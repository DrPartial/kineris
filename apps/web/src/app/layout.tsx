import type { Metadata } from 'next'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import { RuoBar } from '@/components/RuoBar'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { CartProvider } from '@/contexts/CartContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kineris Labs',
  description:
    'UK-based supplier of research peptides, sold strictly for laboratory research use only (RUO).',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <RuoBar />
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
          <CookieConsentBanner />
        </CartProvider>
      </body>
    </html>
  )
}
