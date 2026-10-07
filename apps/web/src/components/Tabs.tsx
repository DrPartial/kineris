'use client'

import { useState, type KeyboardEvent, type ReactNode } from 'react'

interface TabItem {
  id: string
  label: string
  content: ReactNode
}

export function Tabs({ items }: { items: TabItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id)
  const activeIndex = items.findIndex((t) => t.id === activeId)

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const delta = e.key === 'ArrowRight' ? 1 : -1
    const next = items[(activeIndex + delta + items.length) % items.length]
    setActiveId(next.id)
    document.getElementById(`tab-${next.id}`)?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label="Product information" className="flex gap-1 border-b border-border">
        {items.map((item) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={item.id === activeId}
            aria-controls={`panel-${item.id}`}
            tabIndex={item.id === activeId ? 0 : -1}
            onClick={() => setActiveId(item.id)}
            onKeyDown={onKeyDown}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              item.id === activeId ? 'border-accent text-ink' : 'border-transparent text-ink-hint hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${item.id}`}
          hidden={item.id !== activeId}
          className="pt-5"
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
