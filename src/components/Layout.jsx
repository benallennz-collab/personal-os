import { Outlet } from 'react-router-dom'
import { Plus, Sparkles, DatabaseBackup } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout({ onQuickAdd, onBackup }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar onQuickAdd={onQuickAdd} onBackup={onBackup} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-brand-600/30">
              OS
            </div>
            <p className="font-semibold text-slate-900 text-sm tracking-tight">Personal OS</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onBackup}
              aria-label="Backup & Restore"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <DatabaseBackup size={16} />
            </button>
            <button
              onClick={onQuickAdd}
              className="flex items-center gap-1.5 bg-brand-600 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-sm shadow-brand-600/20"
            >
              <Sparkles size={13} />
              Quick Add
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-28 md:pb-10 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

        <button
          onClick={onQuickAdd}
          className="md:hidden fixed right-4 bottom-20 z-40 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-900/25 active:scale-95 transition-transform"
          aria-label="Quick Add"
        >
          <Plus size={22} />
        </button>

        <BottomNav />
      </div>
    </div>
  )
}
