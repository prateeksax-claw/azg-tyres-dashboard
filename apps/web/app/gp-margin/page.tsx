'use client'

import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function GpMarginPage() {
  return (
    <SectionPlaceholder
      eyebrow="Operations"
      title="GP &amp; Margin"
      subtitle="Gross profit deep-dive with anomaly detection and leak tracking"
      ribbonPill="Coming next"
      intro="A dedicated home for margin discipline — blended GP%, GP value trends, the 37 GP alerts already in the snapshot, customer/product-level margin leaks, and Titan-detected anomalies that warrant a pricing or costing review."
      features={[
        { icon: 'percent', tone: 'teal', title: 'Blended GP trend', body: 'GP % and GP value trend with month-over-month deltas and benchmark band.' },
        { icon: 'shield', tone: 'amber', title: 'Margin leak watch', body: 'Top GP alerts ranked by severity — customer × product combinations bleeding margin.' },
        { icon: 'layers', tone: 'blue', title: 'Margin pyramid', body: 'GP attribution across categories and salesmen to find where margin lives or hides.' },
        { icon: 'sparkle', tone: 'purple', title: 'AI anomaly detection', body: 'Titan flags out-of-band GP %s vs the customer\'s 90-day baseline — early signal of price erosion.' },
        { icon: 'bell', tone: 'green', title: 'Approval queue', body: 'Discount approval workflow once pricing rules are wired — for any deal outside the guardrails.' },
      ]}
    />
  )
}
