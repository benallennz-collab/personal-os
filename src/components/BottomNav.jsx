import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../nav'

export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 flex shadow-[0_-4px_16px_-4px_rgb(15_23_42_/_0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-slate-400"
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex items-center justify-center w-9 h-6 rounded-full transition-colors ${
                  isActive ? 'bg-brand-50' : ''
                }`}
              >
                <Icon size={18} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
              </span>
              <span className={`truncate max-w-[56px] ${isActive ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>
                {label.split(' ')[0]}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
