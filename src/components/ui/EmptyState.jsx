export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
          <Icon size={22} className="text-slate-300" />
        </div>
      )}
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {subtitle && <p className="text-xs mt-1 max-w-xs text-slate-400">{subtitle}</p>}
    </div>
  )
}
