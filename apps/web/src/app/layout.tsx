import type { Metadata } from 'next'
import { Manrope, Sora } from 'next/font/google'
import { AccountModal } from '@/components/AccountModal'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import { MobileNav } from '@/components/MobileNav'
import { NavDrawer } from '@/components/NavDrawer'
import { RuoBar } from '@/components/RuoBar'
import { SearchModal } from '@/components/SearchModal'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { WelcomeModal } from '@/components/WelcomeModal'
import { CartProvider } from '@/contexts/CartContext'
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext'
import { OverlayProvider } from '@/contexts/OverlayContext'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-manrope' })
const sora = Sora({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sora' })

export const metadata: Metadata = {
  title: 'Kineris Labs',
  description:
    'UK-based supplier of research peptides, sold strictly for laboratory research use only (RUO).',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${sora.variable}`}>
      <body>
        <CustomerAuthProvider>
          <CartProvider>
            <OverlayProvider>
              <RuoBar />
              <SiteHeader />
              <main className="min-h-screen pb-16 lg:pb-0">{children}</main>
              <SiteFooter />
              <CookieConsentBanner />
              <MobileNav />
              <NavDrawer />
              <SearchModal />
              <AccountModal />
              <WelcomeModal />
            </OverlayProvider>
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  )
}
