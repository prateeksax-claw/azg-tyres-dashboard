'use client'

import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function ActionCenterPage() {
  return (
    <SectionPlaceholder
      eyebrow="Operations"
      title="Action Center"
      subtitle="Single inbox for execution items: ETO risks, GP alerts, collections, customer asks"
      ribbonPill="Coming next"
      intro="A unified inbox that consolidates everything that needs a human decision: ETO shortfalls, GP anomalies, collections breaches and Titan-suggested actions. Each item is assignable, trackable, and closes out automatically when the underlying metric resolves."
      features={[
        { icon: 'inbox', tone: 'blue', title: 'Unified inbox', body: 'ETO risks, GP alerts, collections breaches and customer asks in one ranked feed.' },
        { icon: 'badge', tone: 'amber', title: 'Assignment + ownership', body: 'Assign actions to a salesman or manager; auto-route to the right owner based on customer + product.' },
        { icon: 'check', tone: 'green', title: 'Auto-resolve', body: 'Items close automatically when the underlying metric recovers — no stale tickets.' },
        { icon: 'sparkle', tone: 'purple', title: 'Titan-recommended actions', body: 'Each alert ships with a recommended next step: call, visit, escalate, or discount review.' },
        { icon: 'bell', tone: 'teal', title: 'Live audit trail', body: 'Every action logged with who-did-what-when, surfaceable in the customer 360 history.' },
      ]}
    />
  )
}
