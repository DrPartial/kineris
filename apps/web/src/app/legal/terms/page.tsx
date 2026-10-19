import { LegalPageShell } from '@/components/LegalPageShell'
import { POLICIES } from '@/lib/policies'

export const metadata = { title: `${POLICIES.terms.title} | Kineris Labs` }

export default function TermsPage() {
  return <LegalPageShell title={POLICIES.terms.title} html={POLICIES.terms.html} />
}
