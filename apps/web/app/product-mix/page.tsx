'use client'

import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function ProductMixPage() {
  return (
    <SectionPlaceholder
      eyebrow="Automotive Division"
      title="Product Mix"
      subtitle="Category and brand performance with GP attribution and unit-level analysis"
      ribbonPill="Coming next"
      intro="Drill into PCR/LTR/TBR and other categories — revenue and GP by category, brand mix per category, unit volume vs GP %, and the products quietly carrying or dragging the month. Same DuckDB semantic layer, deeper slicing."
      features={[
        { icon: 'box', tone: 'blue', title: 'Category leaderboard', body: 'PCR/LTR vs TBR vs OTR with MTD revenue, GP value, GP % and unit volume.' },
        { icon: 'layers', tone: 'teal', title: 'Brand mix per category', body: 'Top brands inside each category with share of MTD revenue and GP delta vs last month.' },
        { icon: 'percent', tone: 'amber', title: 'Margin movers', body: 'Products with the largest GP % movement vs last month — pricing and promo signal.' },
        { icon: 'sparkle', tone: 'purple', title: 'AI product insights', body: 'Titan flags which categories deserve a sales push and which look soft this cycle.' },
        { icon: 'shield', tone: 'green', title: 'Stock / availability hook', body: 'Once ERP stock feed is wired, surface fast-moving SKUs at risk of stock-out before EOM.' },
      ]}
    />
  )
}
