import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AZG Tyres Dashboard',
  description: 'Executive management cockpit for Al Zaabi Group Tyres Division',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
