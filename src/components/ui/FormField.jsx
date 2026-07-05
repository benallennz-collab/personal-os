const fieldBase =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500'

export function Label({ children }) {
  return <label className="block text-xs font-medium text-slate-500 mb-1.5">{children}</label>
}

export function Input(props) {
  return <input {...props} className={`${fieldBase} ${props.className || ''}`} />
}

export function Textarea(props) {
  return <textarea {...props} className={`${fieldBase} resize-none ${props.className || ''}`} />
}

export function Select(props) {
  return <select {...props} className={`${fieldBase} bg-white ${props.className || ''}`} />
}

export function Field({ label, children }) {
  return (
    <div className="mb-3.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
