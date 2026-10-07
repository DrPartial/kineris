'use client'

import type { Product } from '@kineris/shared'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api, apiUpload, ApiError } from '@/lib/api'
import { formatGBP } from '@/lib/money'

interface Batch {
  id: string
  batchNumber: string
  coaFileUrl: string | null
  purity: string | null
  reportedAt: string | null
  isCurrent: boolean
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [batches, setBatches] = useState<Batch[]>([])
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [issues, setIssues] = useState<Record<string, string[]> | null>(null)

  function load() {
    api<Product[]>('/api/admin/products').then((all) => setProduct(all.find((p) => p.id === id) ?? null))
    api<Batch[]>(`/api/admin/products/${id}/batches`).then(setBatches)
  }

  useEffect(load, [id])

  async function savePublished(published: boolean) {
    await api(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify({ published }) })
    setSavedAt(Date.now())
    load()
  }

  async function saveFields(fields: Partial<Pick<Product, 'name' | 'casNumber' | 'molecularFormula' | 'molecularWeight' | 'form' | 'storageConditions'>>) {
    setIssues(null)
    try {
      await api(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(fields) })
      setSavedAt(Date.now())
      load()
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { issues?: Record<string, string[]> } | null
        setIssues(body?.issues ?? null)
      } else {
        alert(err instanceof ApiError ? err.message : 'Could not save.')
      }
    }
  }

  async function saveVariant(variantId: string, field: 'stock' | 'priceMinorUnits', value: number) {
    await api(`/api/admin/variants/${variantId}`, { method: 'PATCH', body: JSON.stringify({ [field]: value }) })
    setSavedAt(Date.now())
    load()
  }

  async function addVariant(size: string, priceMinorUnits: number) {
    try {
      await api(`/api/admin/products/${id}/variants`, {
        method: 'POST',
        body: JSON.stringify({ size, priceMinorUnits, stock: 0 }),
      })
      load()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not add variant.')
    }
  }

  async function uploadBatch(formData: FormData) {
    try {
      await apiUpload(`/api/admin/products/${id}/batches`, formData)
      load()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not save batch.')
    }
  }

  if (!product) return <AdminShell><p className="text-sm text-ink-muted">Loading...</p></AdminShell>

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">{product.name}</h1>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={product.published}
            onChange={(e) => savePublished(e.target.checked)}
          />
          Published (visible on storefront)
        </label>
      </div>
      {savedAt && <p className="mt-1 text-xs text-accent">Saved.</p>}

      <ProductFieldsForm product={product} issues={issues} onSave={saveFields} />

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-ink">Variants and stock</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-hint">
              <th className="py-2 font-normal">Size</th>
              <th className="py-2 font-normal">Price</th>
              <th className="py-2 font-normal">Stock</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id} className="border-b border-border">
                <td className="py-2 text-ink">{v.size}</td>
                <td className="py-2">
                  <input
                    type="number"
                    defaultValue={v.priceMinorUnits}
                    onBlur={(e) => saveVariant(v.id, 'priceMinorUnits', Number(e.target.value))}
                    className="w-24 rounded-sm border border-border px-2 py-1"
                  />
                  <span className="ml-2 text-xs text-ink-hint">{formatGBP(v.priceMinorUnits)}</span>
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    defaultValue={v.stock}
                    onBlur={(e) => saveVariant(v.id, 'stock', Number(e.target.value))}
                    className="w-20 rounded-sm border border-border px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <AddVariantForm onAdd={addVariant} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-ink">Batches &amp; Certificates of Analysis</h2>
        <ul className="divide-y divide-border rounded-sm border border-border text-sm">
          {batches.map((b) => (
            <li key={b.id} className="flex items-center justify-between px-3 py-2">
              <span className="data-figure text-ink">
                {b.batchNumber} {b.isCurrent && <span className="text-accent">(current)</span>}
                {b.purity && <span className="ml-2 text-xs text-ink-hint">{b.purity}</span>}
                {b.reportedAt && (
                  <span className="ml-2 text-xs text-ink-hint">
                    reported {new Date(b.reportedAt).toLocaleDateString('en-GB')}
                  </span>
                )}
              </span>
              {b.coaFileUrl ? (
                <a href={b.coaFileUrl} className="text-xs text-accent hover:text-accent-hover">
                  View CoA
                </a>
              ) : (
                <span className="text-xs text-ink-hint">No CoA uploaded</span>
              )}
            </li>
          ))}
          {batches.length === 0 && <li className="px-3 py-2 text-ink-muted">No batches yet.</li>}
        </ul>

        <BatchUploadForm onUpload={uploadBatch} />
      </section>
    </AdminShell>
  )
}

function AddVariantForm({ onAdd }: { onAdd: (size: string, priceMinorUnits: number) => void }) {
  const [size, setSize] = useState('')
  const [price, setPrice] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onAdd(size, Math.round(Number(price) * 100))
        setSize('')
        setPrice('')
      }}
      className="mt-3 flex items-end gap-2"
    >
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Size</label>
        <input value={size} onChange={(e) => setSize(e.target.value)} required className="w-28 rounded-sm border border-border px-2 py-1 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Price (GBP)</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-28 rounded-sm border border-border px-2 py-1 text-sm"
        />
      </div>
      <button type="submit" className="rounded-sm border border-ink px-3 py-1.5 text-sm text-ink hover:bg-surface-sunken">
        Add variant
      </button>
    </form>
  )
}

function BatchUploadForm({ onUpload }: { onUpload: (formData: FormData) => void }) {
  const [batchNumber, setBatchNumber] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const formData = new FormData(form)
        onUpload(formData)
        setBatchNumber('')
        form.reset()
      }}
      className="mt-3 flex items-end gap-2"
    >
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Batch number</label>
        <input
          name="batchNumber"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          required
          className="w-40 rounded-sm border border-border px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Purity</label>
        <input name="purity" placeholder="e.g. 99.1%" className="w-28 rounded-sm border border-border px-2 py-1 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Reported date</label>
        <input name="reportedAt" type="date" className="rounded-sm border border-border px-2 py-1 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-hint">CoA PDF</label>
        <input name="coaFile" type="file" accept="application/pdf" className="text-sm" />
      </div>
      <button type="submit" className="rounded-sm border border-ink px-3 py-1.5 text-sm text-ink hover:bg-surface-sunken">
        Save as current batch
      </button>
    </form>
  )
}

function ProductFieldsForm({
  product,
  issues,
  onSave,
}: {
  product: Product
  issues: Record<string, string[]> | null
  onSave: (fields: Partial<Pick<Product, 'name' | 'casNumber' | 'molecularFormula' | 'molecularWeight' | 'form' | 'storageConditions'>>) => void
}) {
  const [name, setName] = useState(product.name)
  const [casNumber, setCasNumber] = useState(product.casNumber ?? '')
  const [molecularFormula, setMolecularFormula] = useState(product.molecularFormula ?? '')
  const [molecularWeight, setMolecularWeight] = useState(product.molecularWeight ?? '')
  const [form, setForm] = useState(product.form ?? '')
  const [storageConditions, setStorageConditions] = useState(product.storageConditions ?? '')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ name, casNumber, molecularFormula, molecularWeight, form, storageConditions })
      }}
      className="mt-6 max-w-md space-y-3"
    >
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-sm border border-border px-2 py-1.5 text-sm" />
        {issues?.name && <p className="mt-1 text-xs text-red-600">Flagged terms: {issues.name.join(', ')}</p>}
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-hint">CAS number</label>
        <input value={casNumber} onChange={(e) => setCasNumber(e.target.value)} className="w-full rounded-sm border border-border px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Molecular formula</label>
        <input value={molecularFormula} onChange={(e) => setMolecularFormula(e.target.value)} className="w-full rounded-sm border border-border px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Molecular weight</label>
        <input value={molecularWeight} onChange={(e) => setMolecularWeight(e.target.value)} className="w-full rounded-sm border border-border px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Form</label>
        <input value={form} onChange={(e) => setForm(e.target.value)} className="w-full rounded-sm border border-border px-2 py-1.5 text-sm" />
        {issues?.form && <p className="mt-1 text-xs text-red-600">Flagged terms: {issues.form.join(', ')}</p>}
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-hint">Storage conditions</label>
        <input
          value={storageConditions}
          onChange={(e) => setStorageConditions(e.target.value)}
          className="w-full rounded-sm border border-border px-2 py-1.5 text-sm"
        />
        {issues?.storageConditions && (
          <p className="mt-1 text-xs text-red-600">Flagged terms: {issues.storageConditions.join(', ')}</p>
        )}
      </div>
      <button type="submit" className="rounded-sm border border-ink px-3 py-1.5 text-sm text-ink hover:bg-surface-sunken">
        Save details
      </button>
    </form>
  )
}
