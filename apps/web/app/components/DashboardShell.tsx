'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useState } from 'react'
import { dashboardData } from '../../lib/dashboard-data'
import { formatGeneratedAt } from '../../lib/format'
import { Icon } from './Icon'

type NavItem = { label: string; href: string; icon: string }

const MAIN_NAV: NavItem[] = [
  { label: 'Executive Command', href: '/', icon: 'gauge' },
  { label: 'Sales & Targets', href: '/sales-targets', icon: 'target' },
  { label: 'Region', href: '/region', icon: 'map' },
  { label: 'Salesman', href: '/salesman', icon: 'user' },
  { label: 'Product Mix', href: '/product-mix', icon: 'box' },
]

const OPS_NAV: NavItem[] = [
  { label: 'Customer 360', href: '/customer-360', icon: 'users' },
  { label: 'GP & Margin', href: '/gp-margin', icon: 'percent' },
  { label: 'Projection', href: '/projection', icon: 'trend' },
  { label: 'Action Center', href: '/action-center', icon: 'check' },
]

const SidebarToggleContext = createContext<{ open: () => void }>({ open: () => {} })

export function SidebarToggle() {
  const { open } = useContext(SidebarToggleContext)
  return (
    <button type="button" className="sidebar-toggle" onClick={open} aria-label="Open menu">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const refreshedAt = formatGeneratedAt(String(dashboardData.generated_at || ''))

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.label}
      className={isActive(item.href) ? 'active' : ''}
      href={item.href}
      onClick={() => setSidebarOpen(false)}
    >
      <span><Icon name={item.icon} size={15} /></span>{item.label}
    </Link>
  )

  return (
    <SidebarToggleContext.Provider value={{ open: () => setSidebarOpen(true) }}>
      <main className={`command-artboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden={!sidebarOpen}
          tabIndex={-1}
        />
        <aside className="side-rail">
          <div className="side-logo">
            <img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" />
            <strong>TYRES DIVISION</strong>
            <button
              type="button"
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav>
            <small className="nav-section-label">Main Menu</small>
            {MAIN_NAV.map(renderNavItem)}
            <small className="nav-section-label">Operations</small>
            {OPS_NAV.map(renderNavItem)}
          </nav>
          <div className="side-update">
            <i><Icon name="clock" size={12} /></i>
            <span>Last Updated</span>
            <b>{refreshedAt} GST</b>
          </div>
        </aside>

        <section className="command-canvas">{children}</section>

        <footer className="command-footer">
          <span>Focus. Execute. Outperform.</span>
          <span>Driven by Performance. Powered by People.</span>
          <img src="/brand/al-zaabi-logo-light.png" alt="Al Zaabi Group" />
        </footer>
      </main>
    </SidebarToggleContext.Provider>
  )
}

// Re-export the breadcrumb / page-header helper
export function PageHeader({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="top-ribbon">
      <div className="dashboard-greeting">
        <SidebarToggle />
        <div className="greeting-text">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children && <div className="top-control-cluster">{children}</div>}
    </header>
  )
}
