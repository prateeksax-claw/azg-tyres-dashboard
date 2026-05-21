'use client'

import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function ProjectionPage() {
  return (
    <SectionPlaceholder
      eyebrow="Operations"
      title="Projection Cockpit"
      subtitle="Live projection vs ETO with confidence scoring and recovery planning"
      ribbonPill="Coming next"
      intro="The projection-first workspace — confidence-weighted projection vs MTD vs ETO close, with recovery scenarios that estimate how many incremental customer asks it takes to close the gap, and Titan-recommended call lists ordered by pipeline strength."
      features={[
        { icon: 'target', tone: 'blue', title: 'Projection bridge', body: 'Projection target → MTD → LPO → Confirmed → Gap. Same bridge as Executive Command, drillable.' },
        { icon: 'trend', tone: 'teal', title: 'Confidence-weighted forecast', body: 'ETO with confidence bands based on last-90-day actual close rate per salesman and customer.' },
        { icon: 'sparkle', tone: 'purple', title: 'Recovery scenarios', body: 'What-if: add N customers at avg ticket → see the projection impact instantly.' },
        { icon: 'badge', tone: 'amber', title: 'Recommended call list', body: 'Titan-ranked customers most likely to close incremental business before EOM.' },
        { icon: 'bell', tone: 'green', title: 'Daily projection digest', body: 'Once email/Slack hook ships, push a morning brief: "Yesterday\'s movement, today\'s asks."' },
      ]}
    />
  )
}
