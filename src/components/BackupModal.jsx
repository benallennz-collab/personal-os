import { useRef, useState } from 'react'
import { Download, Upload, ShieldCheck, LogOut } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { toISODate } from '../utils/date'

export default function BackupModal({ open, onClose }) {
  const { exportAll, importAll } = useData()
  const { user, signOut } = useAuth()
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState(null)

  const handleExport = () => {
    const data = exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-os-backup-${toISODate(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus({ type: 'success', message: 'Backup file downloaded.' })
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!confirm('This will replace all current data in your account with the contents of this backup file. Continue?')) {
          e.target.value = ''
          return
        }
        importAll(data)
        setStatus({ type: 'success', message: 'Backup restored successfully.' })
      } catch (err) {
        setStatus({ type: 'error', message: 'That file could not be read as a valid backup.' })
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const handleClose = () => {
    setStatus(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Backup & Restore">
      <p className="text-sm text-slate-500 mb-5 leading-relaxed">
        Your data syncs live to your account, but a downloaded backup is still worth keeping — it protects you if
        this account, project, or internet access is ever unavailable.
      </p>

      <div className="space-y-3">
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Download size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Export backup</p>
            <p className="text-xs text-slate-500">Download all your data as a JSON file</p>
          </div>
        </button>

        <button
          onClick={handleImportClick}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Upload size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Restore from backup</p>
            <p className="text-xs text-slate-500">Replace current data with a backup file</p>
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 mt-4 px-3.5 py-2.5 rounded-xl text-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}
        >
          <ShieldCheck size={15} className="shrink-0" />
          {status.message}
        </div>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="text-sm text-slate-700 truncate">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
          <Button type="button" variant="secondary" onClick={handleClose}>Done</Button>
        </div>
      </div>
    </Modal>
  )
}
