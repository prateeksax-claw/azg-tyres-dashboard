import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DashboardShell } from './components/DashboardShell'

export const metadata: Metadata = {
  title: 'AZG Tyres Dashboard',
  description: 'Executive management cockpit for Al Zaabi Group Tyres Division',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  )
}
