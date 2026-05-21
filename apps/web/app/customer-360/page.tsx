'use client'

import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function Customer360Page() {
  return (
    <SectionPlaceholder
      eyebrow="Operations"
      title="Customer 360"
      subtitle="Per-customer execution snapshot with billing, projection, collections and visit history"
      ribbonPill="Coming next"
      intro="Search any of the 260+ active accounts and pull up MTD billing, projection vs achievement, GP %, outstanding and overdue receivables, and the conversation history attached by Titan and Sunny. The single screen sales managers will pull up before every customer call."
      features={[
        { icon: 'users', tone: 'blue', title: 'Customer search + spotlight', body: 'Type-ahead search across all customers; spotlight panel shows MTD vs projection, ETO close and pacing.' },
        { icon: 'wallet', tone: 'amber', title: 'Collections snapshot', body: 'Outstanding, overdue (with bucket aging), days-payable-outstanding and PDC schedule.' },
        { icon: 'percent', tone: 'teal', title: 'Margin behaviour', body: 'GP % and GP value trend per customer with category-level breakdown of what they buy.' },
        { icon: 'bell', tone: 'green', title: 'Visit + call log', body: 'Field visits, call notes and Titan agent interactions captured against this customer.' },
        { icon: 'sparkle', tone: 'purple', title: 'AI account brief', body: 'One-paragraph Titan summary: pacing, risks, recommended next action before the next visit.' },
      ]}
    />
  )
}
