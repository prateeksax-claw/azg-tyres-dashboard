'use client'

import { useState } from 'react'
import { Icon } from './Icon'

export function CardOptions({ label }: { label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`card-options ${open ? 'open' : ''}`} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="card-options-trigger" onClick={() => setOpen((v) => !v)} aria-label={`Options for ${label}`} title={`Options for ${label}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {open && (
        <div className="card-options-menu" role="menu">
          <button role="menuitem" type="button" onClick={() => setOpen(false)}><Icon name="refresh" size={13} /> Refresh data</button>
          <button role="menuitem" type="button" onClick={() => setOpen(false)}><Icon name="trend" size={13} /> Expand view</button>
          <button role="menuitem" type="button" onClick={() => setOpen(false)}><Icon name="dollar" size={13} /> Export CSV</button>
          <button role="menuitem" type="button" onClick={() => setOpen(false)}><Icon name="check" size={13} /> Pin to top</button>
        </div>
      )}
    </div>
  )
}
