export function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')
  const palette = ['blue', 'teal', 'purple', 'amber', 'pink', 'green', 'indigo'] as const
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const tone = palette[hash % palette.length]
  return <span className={`avatar avatar-${tone}`}>{initials.toUpperCase()}</span>
}
