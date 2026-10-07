import type { Metadata } from 'next'
import { Manrope, Sora } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-manrope' })
const sora = Sora({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sora' })

export const metadata: Metadata = {
  title: 'Kineris Admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  )
}
