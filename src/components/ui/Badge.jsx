const COLORS = {
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/70',
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200/70',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/70',
  red: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200/70',
  blue: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200/70',
}

export default function Badge({ children, color = 'slate' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tracking-tight ${COLORS[color] || COLORS.slate}`}>
      {children}
    </span>
  )
}
