'use client'

import { Icon } from './Icon'
import { SidebarToggle } from './DashboardShell'

type Feature = { icon: string; tone: 'green' | 'amber' | 'teal' | 'purple' | 'blue'; title: string; body: string }

export function SectionPlaceholder({
  eyebrow,
  title,
  subtitle,
  intro,
  features,
  ribbonPill,
}: {
  eyebrow: string
  title: string
  subtitle: string
  intro: string
  features: Feature[]
  ribbonPill?: string
}) {
  return (
    <>
      <header className="top-ribbon">
        <div className="dashboard-greeting">
          <SidebarToggle />
          <div className="greeting-text">
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{subtitle} {ribbonPill && <b className="ui-version-pill">{ribbonPill}</b>}</p>
          </div>
        </div>
        <div className="top-control-cluster">
          <label className="global-search"><Icon name="search" size={15} /> <em>Search&hellip;</em></label>
          <div className="filter-row">
            <button><Icon name="calendar" size={14} /> May 2026</button>
            <button><Icon name="pin" size={14} /> All Regions</button>
            <button className="export"><Icon name="refresh" size={14} /> Refresh</button>
          </div>
          <button className="ai-pill" type="button"><Icon name="sparkle" size={14} /> Ask Titan</button>
        </div>
      </header>

      <section className="section-placeholder">
        <div className="placeholder-icon">
          <Icon name="layers" size={28} />
        </div>
        <h2>{title}</h2>
        <p>{intro}</p>

        <div className="placeholder-features">
          {features.map((f) => (
            <article key={f.title} className={f.tone}>
              <span><Icon name={f.icon} size={14} /></span>
              <strong>{f.title}</strong>
              <small>{f.body}</small>
            </article>
          ))}
        </div>

        <div className="placeholder-cta">
          <button className="primary" type="button"><Icon name="sparkle" size={14} /> Ask Titan to draft this view</button>
          <button className="ghost" type="button"><Icon name="bell" size={14} /> Notify me when ready</button>
        </div>
      </section>
    </>
  )
}
