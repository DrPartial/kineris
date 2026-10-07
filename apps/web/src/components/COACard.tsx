import type { Batch, CoaListing } from '@kineris/shared'
import { Badge } from './Badge'

function freshnessLabel(reportedAt: string | null): string | null {
  if (!reportedAt) return null
  const days = Math.max(0, Math.round((Date.now() - new Date(reportedAt).getTime()) / (1000 * 60 * 60 * 24)))
  if (days === 0) return 'Tested today'
  if (days === 1) return 'Tested 1 day ago'
  return `Tested ${days} days ago`
}

/**
 * Renders a batch's Certificate of Analysis, honestly: a real PDF link when
 * one has been uploaded, or a "pending" state when it hasn't -- never the
 * old dead-end "available on request" copy, and never a fabricated number.
 */
export function COACard({ batch, productName }: { batch: Batch | CoaListing; productName?: string }) {
  const name = productName ?? ('product' in batch ? batch.product.name : undefined)
  const fresh = freshnessLabel(batch.reportedAt)

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          {name && <p className="text-sm font-medium text-ink">{name}</p>}
          <p className="data-figure text-xs text-ink-hint">Batch {batch.batchNumber}</p>
        </div>
        {batch.purity && <Badge variant="verified">{batch.purity} purity</Badge>}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-hint">
        {batch.reportedAt && (
          <span className="data-figure">
            Reported {new Date(batch.reportedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {fresh && <span>{fresh}</span>}
      </div>

      {batch.coaFileUrl ? (
        <a
          href={batch.coaFileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-hover"
        >
          View / download Certificate of Analysis (PDF)
        </a>
      ) : (
        <p className="mt-3 text-sm text-ink-hint">CoA pending for this batch, check back soon.</p>
      )}
    </div>
  )
}
