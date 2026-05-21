const ICON_STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const s = size
  const props = { width: s, height: s, viewBox: '0 0 24 24', ...ICON_STROKE, 'aria-hidden': true }
  switch (name) {
    case 'gauge': return <svg {...props}><path d="M3 12a9 9 0 1 1 18 0" /><path d="M12 12l4-3" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></svg>
    case 'target': return <svg {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></svg>
    case 'map': return <svg {...props}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></svg>
    case 'user': return <svg {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>
    case 'users': return <svg {...props}><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5M14 19c0-2.4 1.7-4 4-4s3 1.6 3 4" /></svg>
    case 'box': return <svg {...props}><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg>
    case 'percent': return <svg {...props}><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /><path d="M19 5 5 19" /></svg>
    case 'trend': return <svg {...props}><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
    case 'check': return <svg {...props}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12l3 3 5-6" /></svg>
    case 'search': return <svg {...props}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
    case 'calendar': return <svg {...props}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
    case 'pin': return <svg {...props}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
    case 'badge': return <svg {...props}><circle cx="12" cy="9" r="4" /><path d="M9 13l-1 8 4-2 4 2-1-8" /></svg>
    case 'refresh': return <svg {...props}><path d="M4 12a8 8 0 0 1 14-5.3L20 9" /><path d="M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15" /><path d="M4 20v-5h5" /></svg>
    case 'sparkle': return <svg {...props}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>
    case 'bills': return <svg {...props}><rect x="3" y="6" width="18" height="13" rx="2" /><circle cx="12" cy="12.5" r="2.5" /><path d="M7 9v.01M17 16v.01" /></svg>
    case 'dollar': return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M9 14.5c0 1.4 1.4 2 3 2s3-.7 3-2-1.5-1.7-3-2-3-.6-3-2 1.4-2 3-2 3 .6 3 2" /><path d="M12 7v10" /></svg>
    case 'clock': return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
    case 'bolt': return <svg {...props}><path d="M13 3 4 14h7l-1 7 9-11h-7z" /></svg>
    case 'flag': return <svg {...props}><path d="M5 21V4" /><path d="M5 5h12l-2 4 2 4H5" /></svg>
    case 'shield': return <svg {...props}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
    case 'arrow-up-right': return <svg {...props}><path d="M7 17 17 7" /><path d="M9 7h8v8" /></svg>
    case 'chevron-down': return <svg {...props}><path d="m6 9 6 6 6-6" /></svg>
    case 'chevron-right': return <svg {...props}><path d="m9 6 6 6-6 6" /></svg>
    case 'arrow-right': return <svg {...props}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
    case 'layers': return <svg {...props}><path d="M12 3 3 8l9 5 9-5z" /><path d="M3 13l9 5 9-5M3 18l9 5 9-5" /></svg>
    case 'pie': return <svg {...props}><path d="M21 12A9 9 0 1 1 12 3v9z" /><path d="M12 3a9 9 0 0 1 9 9h-9z" /></svg>
    case 'wallet': return <svg {...props}><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1.6" fill="currentColor" stroke="none" /></svg>
    case 'inbox': return <svg {...props}><path d="M3 13l3-9h12l3 9" /><path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-6l-2 3h-4l-2-3z" /></svg>
    case 'bell': return <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8z" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>
    default: return <svg {...props}><circle cx="12" cy="12" r="8" /></svg>
  }
}
