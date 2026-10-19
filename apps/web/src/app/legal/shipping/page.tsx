import { LegalPageShell } from '@/components/LegalPageShell'
import { POLICIES } from '@/lib/policies'

export const metadata = { title: `${POLICIES.shipping.title} | Kineris Labs` }

export default function ShippingPolicyPage() {
  return <LegalPageShell title={POLICIES.shipping.title} html={POLICIES.shipping.html} />
}
