'use client'

import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function RegionPage() {
  return (
    <SectionPlaceholder
      eyebrow="Automotive Division"
      title="Region Performance"
      subtitle="Region-by-region MTD, projection achievement and customer concentration"
      ribbonPill="Coming next"
      intro="A live region map of Abu Dhabi, Dubai, Al Ain and Sharjah with MTD sales, projection achievement, GP%, customer concentration and same-store growth comparisons — all backed by the same live snapshot powering Executive Command."
      features={[
        { icon: 'map', tone: 'blue', title: 'UAE region map', body: 'Heat-shaded UAE map with each emirate showing MTD sales, projection achievement and active customers.' },
        { icon: 'trend', tone: 'green', title: 'YoY / MoM trend', body: 'Region revenue and GP trend over the last 13 months with projection target overlay.' },
        { icon: 'users', tone: 'teal', title: 'Customer concentration', body: 'Top customers per region, % of regional MTD, and risk score from outstanding/overdue receivables.' },
        { icon: 'sparkle', tone: 'purple', title: 'AI region insights', body: 'Titan highlights leading region, biggest mover, and emerging share shifts to investigate.' },
        { icon: 'bell', tone: 'amber', title: 'Live visit log', body: 'Field visit log per region (when Sunny field-agent integration goes live) — visit-to-billing conversion.' },
      ]}
    />
  )
}
