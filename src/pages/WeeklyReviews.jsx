import { useState } from 'react'
import { Plus, Trash2, ClipboardList, Trophy, AlertTriangle, Lightbulb as Bulb, ArrowRightCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { Field, Input, Textarea } from '../components/ui/FormField'
import { useData } from '../context/DataContext'
import { formatFullDate, getWeekDates, toISODate } from '../utils/date'

const emptyForm = { weekOf: toISODate(getWeekDates()[0]), wins: '', challenges: '', lessons: '', nextFocus: '' }

function ReviewRow({ icon: Icon, label, text, accent }) {
  if (!text) return null
  return (
    <div className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0 pt-1">
        <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

export default function WeeklyReviews() {
  const { reviews, addReview, deleteReview } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const sorted = [...reviews].sort((a, b) => (a.weekOf < b.weekOf ? 1 : -1))

  const handleSubmit = (e) => {
    e.preventDefault()
    addReview({ ...form })
    setForm({ ...emptyForm, weekOf: toISODate(getWeekDates()[0]) })
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Weekly Executive Reviews"
        subtitle="Reflect, learn, and set focus for the week ahead"
        action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> New Review</Button>}
      />

      {sorted.length === 0 ? (
        <Card>
          <EmptyState icon={ClipboardList} title="No reviews yet" subtitle="Start your first weekly executive review." />
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {sorted.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between mb-1 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 tracking-tight">Week of {formatFullDate(r.weekOf)}</h3>
                <button onClick={() => deleteReview(r.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                <ReviewRow icon={Trophy} label="Wins" text={r.wins} accent="bg-emerald-50 text-emerald-600" />
                <ReviewRow icon={AlertTriangle} label="Challenges" text={r.challenges} accent="bg-amber-50 text-amber-600" />
                <ReviewRow icon={Bulb} label="Lessons" text={r.lessons} accent="bg-brand-50 text-brand-600" />
                <ReviewRow icon={ArrowRightCircle} label="Next Week Focus" text={r.nextFocus} accent="bg-slate-100 text-slate-500" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Weekly Review">
        <form onSubmit={handleSubmit}>
          <Field label="Week Of">
            <Input type="date" value={form.weekOf} onChange={(e) => setForm({ ...form, weekOf: e.target.value })} />
          </Field>
          <Field label="Wins">
            <Textarea rows={2} value={form.wins} onChange={(e) => setForm({ ...form, wins: e.target.value })} placeholder="What went well this week?" />
          </Field>
          <Field label="Challenges">
            <Textarea rows={2} value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} placeholder="What was hard or fell short?" />
          </Field>
          <Field label="Lessons">
            <Textarea rows={2} value={form.lessons} onChange={(e) => setForm({ ...form, lessons: e.target.value })} placeholder="What did you learn?" />
          </Field>
          <Field label="Next Week Focus">
            <Textarea rows={2} value={form.nextFocus} onChange={(e) => setForm({ ...form, nextFocus: e.target.value })} placeholder="What matters most next week?" />
          </Field>
          <div className="flex justify-end gap-2 mt-5">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Review</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
