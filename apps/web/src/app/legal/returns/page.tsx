import { LegalPageShell } from '@/components/LegalPageShell'
import { POLICIES } from '@/lib/policies'

export const metadata = { title: `${POLICIES.returns.title} | Kineris Labs` }

export default function ReturnsPolicyPage() {
  return <LegalPageShell title={POLICIES.returns.title} html={POLICIES.returns.html} />
}
