import { Loader2 } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function DataGate({ children }) {
  const { loaded } = useData()

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={24} className="animate-spin text-brand-600" />
      </div>
    )
  }

  return children
}
