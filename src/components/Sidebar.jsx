import { NavLink } from 'react-router-dom'
import { Sparkles, DatabaseBackup, LogOut } from 'lucide-react'
import { NAV_ITEMS } from '../nav'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ onQuickAdd, onBackup }) {
  const { user, signOut } = useAuth()

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-200/80 bg-white">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-brand-600/30">
            OS
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 leading-tight tracking-tight">Personal OS</p>
            <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email ?? 'v1.0'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto scrollbar-thin">
        <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Menu</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-brand-600 transition-all duration-200 ${
                      isActive ? 'h-4 opacity-100' : 'h-0 opacity-0'
                    }`}
                  />
                  <Icon size={18} className={isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-500'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-1.5">
        <button
          onClick={onQuickAdd}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2.5 rounded-xl shadow-sm shadow-brand-600/20 hover:shadow-md hover:shadow-brand-600/25 transition-all duration-150"
        >
          <Sparkles size={16} />
          Quick Add
        </button>
        <div className="flex gap-1">
          <button
            onClick={onBackup}
            className="flex-1 flex items-center justify-center gap-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <DatabaseBackup size={14} />
            Backup
          </button>
          <button
            onClick={signOut}
            className="flex-1 flex items-center justify-center gap-1.5 text-slate-500 hover:bg-slate-50 hover:text-red-600 text-xs font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
