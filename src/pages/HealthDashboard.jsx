import { useState } from 'react'
import { Plus, Trash2, Moon, Scale, Droplet, Smile, HeartPulse, Dumbbell } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PageHeader from '../components/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { Field, Input, Textarea } from '../components/ui/FormField'
import { useData } from '../context/DataContext'
import { formatDateLabel, toISODate } from '../utils/date'

const emptyForm = { date: toISODate(new Date()), sleepHours: '', weight: '', water: '', mood: 3, exercise: false, notes: '' }

function MiniStat({ icon: Icon, label, value, accent }) {
  return (
    <Card className="flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-900 leading-tight tabular-nums tracking-tight truncate">{value}</p>
        <p className="text-xs text-slate-500 truncate">{label}</p>
      </div>
    </Card>
  )
}

export default function HealthDashboard() {
  const { healthLogs, addHealthLog, deleteHealthLog } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const sorted = [...healthLogs].sort((a, b) => (a.date < b.date ? 1 : -1))
  const chartData = [...healthLogs]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-14)
    .map((h) => ({ label: formatDateLabel(h.date), sleep: h.sleepHours, weight: h.weight }))

  const latest = sorted[0]
  const last7 = sorted.slice(0, 7)
  const exerciseDays = last7.filter((h) => h.exercise).length
  const avgWater = last7.length ? (last7.reduce((s, h) => s + (h.water || 0), 0) / last7.length).toFixed(1) : '—'

  const handleSubmit = (e) => {
    e.preventDefault()
    addHealthLog({
      date: form.date,
      sleepHours: form.sleepHours ? Number(form.sleepHours) : null,
      weight: form.weight ? Number(form.weight) : null,
      water: form.water ? Number(form.water) : null,
      mood: Number(form.mood),
      exercise: form.exercise,
      notes: form.notes,
    })
    setForm(emptyForm)
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Health Dashboard"
        subtitle="Sleep, weight, hydration, and mood at a glance"
        action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Log Entry</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <MiniStat icon={Moon} label="Latest sleep" value={latest?.sleepHours != null ? `${latest.sleepHours}h` : '—'} accent="bg-indigo-50 text-indigo-600" />
        <MiniStat icon={Scale} label="Latest weight" value={latest?.weight ?? '—'} accent="bg-sky-50 text-sky-600" />
        <MiniStat icon={Droplet} label="Avg water (7d)" value={avgWater} accent="bg-cyan-50 text-cyan-600" />
        <MiniStat icon={Dumbbell} label="Exercise days (7d)" value={exerciseDays} accent="bg-emerald-50 text-emerald-600" />
      </div>

      <Card className="mb-5 sm:mb-6">
        <h3 className="font-semibold text-slate-900 tracking-tight text-[15px] mb-5">Sleep Trend</h3>
        {chartData.length === 0 ? (
          <EmptyState icon={HeartPulse} title="No data yet" subtitle="Log an entry to see your trend." />
        ) : (
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#e2e8f0" tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#e2e8f0" tickLine={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(15 23 42 / 0.08)' }} />
                <Area type="monotone" dataKey="sleep" stroke="#4f46e5" strokeWidth={2.5} fill="url(#sleepFill)" name="Sleep (hrs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card padding={false}>
        <div className="p-5 sm:p-6 pb-0">
          <h3 className="font-semibold text-slate-900 tracking-tight text-[15px] mb-1">Log History</h3>
        </div>
        {sorted.length === 0 ? (
          <div className="p-5"><EmptyState icon={HeartPulse} title="No logs yet" /></div>
        ) : (
          <ul className="divide-y divide-slate-100 mt-2">
            {sorted.map((h) => (
              <li key={h.id} className="flex items-center gap-4 px-5 sm:px-6 py-3.5 text-sm">
                <span className="w-14 shrink-0 text-slate-500 text-xs font-medium">{formatDateLabel(h.date)}</span>
                <span className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 text-[13px]">
                  <span className="flex items-center gap-1.5"><Moon size={13} className="text-indigo-400" />{h.sleepHours ?? '—'}h</span>
                  <span className="flex items-center gap-1.5"><Scale size={13} className="text-sky-400" />{h.weight ?? '—'}</span>
                  <span className="flex items-center gap-1.5"><Droplet size={13} className="text-cyan-400" />{h.water ?? '—'}</span>
                  <span className="flex items-center gap-1.5"><Smile size={13} className="text-amber-400" />{h.mood ?? '—'}/5</span>
                </span>
                <button onClick={() => deleteHealthLog(h.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Health Entry">
        <form onSubmit={handleSubmit}>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Sleep (hrs)">
              <Input type="number" step="0.5" value={form.sleepHours} onChange={(e) => setForm({ ...form, sleepHours: e.target.value })} />
            </Field>
            <Field label="Weight">
              <Input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </Field>
            <Field label="Water (cups)">
              <Input type="number" value={form.water} onChange={(e) => setForm({ ...form, water: e.target.value })} />
            </Field>
          </div>
          <Field label={`Mood (${form.mood}/5)`}>
            <input type="range" min="1" max="5" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} className="w-full accent-brand-600" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-600 mb-3.5">
            <input type="checkbox" checked={form.exercise} onChange={(e) => setForm({ ...form, exercise: e.target.checked })} className="rounded accent-brand-600" />
            Exercised today
          </label>
          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 mt-5">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Entry</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
