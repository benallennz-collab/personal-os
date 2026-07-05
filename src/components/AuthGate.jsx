import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import { Field, Input } from './ui/FormField'
import { useAuth } from '../context/AuthContext'

export default function AuthGate({ children }) {
  const { session, loading, error, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={24} className="animate-spin text-brand-600" />
      </div>
    )
  }

  if (session) return children

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setNotice('')
    if (mode === 'signin') {
      await signIn(email, password)
    } else {
      const ok = await signUp(email, password)
      if (ok) setNotice('Account created. Check your email to confirm, then sign in.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-brand-600/30">
            OS
          </div>
          <p className="font-semibold text-slate-900 tracking-tight">Personal OS</p>
        </div>

        <h1 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
          {mode === 'signin' ? 'Sign in' : 'Create your account'}
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          {mode === 'signin' ? 'Sign in to sync your data across devices.' : 'One account keeps every device in sync.'}
        </p>

        <form onSubmit={handleSubmit}>
          <Field label="Email">
            <Input type="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {notice && <p className="text-sm text-emerald-600 mb-3">{notice}</p>}

          <Button type="submit" className="w-full justify-center" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-700 mt-4"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </Card>
    </div>
  )
}
