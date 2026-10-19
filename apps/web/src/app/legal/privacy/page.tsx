import { LegalPageShell } from '@/components/LegalPageShell'
import { POLICIES } from '@/lib/policies'

export const metadata = { title: `${POLICIES.privacy.title} | Kineris Labs` }

export default function PrivacyPage() {
  return <LegalPageShell title={POLICIES.privacy.title} html={POLICIES.privacy.html} />
}
