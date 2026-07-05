import { useEffect, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { useData } from '../context/DataContext'

const LEGACY_KEYS = {
  goals: 'pos.goals',
  tasks: 'pos.tasks',
  healthLogs: 'pos.healthLogs',
  reviews: 'pos.reviews',
  ideas: 'pos.ideas',
}

function readLegacyData() {
  const data = {}
  let hasAny = false
  for (const [key, storageKey] of Object.entries(LEGACY_KEYS)) {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        data[key] = parsed
        hasAny = true
      }
    } catch {
      // ignore unreadable legacy data
    }
  }
  return hasAny ? data : null
}

export default function MigrationPrompt() {
  const { loaded, goals, tasks, healthLogs, reviews, ideas, importAll } = useData()
  const [legacyData, setLegacyData] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [importing, setImporting] = useState(false)

  const cloudIsEmpty = goals.length === 0 && tasks.length === 0 && healthLogs.length === 0 && reviews.length === 0 && ideas.length === 0

  useEffect(() => {
    if (loaded && cloudIsEmpty && !legacyData) {
      const found = readLegacyData()
      if (found) setLegacyData(found)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, cloudIsEmpty])

  if (!legacyData || dismissed) return null

  const totalItems = Object.values(legacyData).reduce((sum, arr) => sum + arr.length, 0)

  const handleImport = async () => {
    setImporting(true)
    await importAll(legacyData)
    Object.values(LEGACY_KEYS).forEach((key) => localStorage.removeItem(key))
    setImporting(false)
    setDismissed(true)
  }

  return (
    <Modal open onClose={() => setDismissed(true)} title="Import your previous data?">
      <div className="flex gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
          <UploadCloud size={18} />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          We found <strong>{totalItems} item{totalItems === 1 ? '' : 's'}</strong> saved on this device from before
          cloud sync was set up. Import it into your account now so it shows up on every device?
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => setDismissed(true)} disabled={importing}>
          Skip
        </Button>
        <Button type="button" onClick={handleImport} disabled={importing}>
          {importing ? 'Importing…' : 'Import my data'}
        </Button>
      </div>
    </Modal>
  )
}
