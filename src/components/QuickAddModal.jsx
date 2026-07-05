import { useState } from 'react'
import { CheckSquare, Target, Lightbulb, HeartPulse } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { Field, Input, Select, Textarea } from './ui/FormField'
import { useData } from '../context/DataContext'
import { toISODate } from '../utils/date'

const TYPES = [
  { key: 'task', label: 'Task', icon: CheckSquare },
  { key: 'goal', label: 'Goal', icon: Target },
  { key: 'idea', label: 'Idea', icon: Lightbulb },
  { key: 'health', label: 'Health Log', icon: HeartPulse },
]

const initialForms = {
  task: { title: '', date: toISODate(new Date()), priority: 'medium' },
  goal: { title: '', category: 'Personal', target: '', current: '', unit: '', deadline: '' },
  idea: { text: '', tag: '' },
  health: { date: toISODate(new Date()), sleepHours: '', weight: '', water: '', mood: 3, exercise: false, notes: '' },
}

export default function QuickAddModal({ open, onClose }) {
  const { addTask, addGoal, addIdea, addHealthLog } = useData()
  const [type, setType] = useState('task')
  const [forms, setForms] = useState(initialForms)

  const form = forms[type]
  const updateForm = (patch) => setForms((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }))

  const handleClose = () => {
    setForms(initialForms)
    setType('task')
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (type === 'task') {
      if (!form.title.trim()) return
      addTask({ title: form.title.trim(), date: form.date, priority: form.priority, done: false })
    } else if (type === 'goal') {
      if (!form.title.trim()) return
      addGoal({
        title: form.title.trim(),
        category: form.category,
        target: Number(form.target) || 0,
        current: Number(form.current) || 0,
        unit: form.unit,
        deadline: form.deadline,
      })
    } else if (type === 'idea') {
      if (!form.text.trim()) return
      addIdea({ text: form.text.trim(), tag: form.tag.trim() || 'General', status: 'new' })
    } else if (type === 'health') {
      addHealthLog({
        date: form.date,
        sleepHours: form.sleepHours ? Number(form.sleepHours) : null,
        weight: form.weight ? Number(form.weight) : null,
        water: form.water ? Number(form.water) : null,
        mood: Number(form.mood),
        exercise: form.exercise,
        notes: form.notes,
      })
    }
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Quick Add">
      <div className="grid grid-cols-4 gap-2 mb-4">
        {TYPES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
              type === key
                ? 'bg-brand-50 border-brand-200 text-brand-700'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {type === 'task' && (
          <>
            <Field label="Title">
              <Input autoFocus value={form.title} onChange={(e) => updateForm({ title: e.target.value })} placeholder="e.g. Finish client deck" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <Input type="date" value={form.date} onChange={(e) => updateForm({ date: e.target.value })} />
              </Field>
              <Field label="Priority">
                <Select value={form.priority} onChange={(e) => updateForm({ priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </Field>
            </div>
          </>
        )}

        {type === 'goal' && (
          <>
            <Field label="Title">
              <Input autoFocus value={form.title} onChange={(e) => updateForm({ title: e.target.value })} placeholder="e.g. Launch new website" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <Select value={form.category} onChange={(e) => updateForm({ category: e.target.value })}>
                  <option>Business</option>
                  <option>Health</option>
                  <option>Finance</option>
                  <option>Personal</option>
                </Select>
              </Field>
              <Field label="Deadline">
                <Input type="date" value={form.deadline} onChange={(e) => updateForm({ deadline: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Current">
                <Input type="number" value={form.current} onChange={(e) => updateForm({ current: e.target.value })} />
              </Field>
              <Field label="Target">
                <Input type="number" value={form.target} onChange={(e) => updateForm({ target: e.target.value })} />
              </Field>
              <Field label="Unit">
                <Input value={form.unit} onChange={(e) => updateForm({ unit: e.target.value })} placeholder="$, books..." />
              </Field>
            </div>
          </>
        )}

        {type === 'idea' && (
          <>
            <Field label="Idea">
              <Textarea autoFocus rows={3} value={form.text} onChange={(e) => updateForm({ text: e.target.value })} placeholder="Capture the idea..." />
            </Field>
            <Field label="Tag">
              <Input value={form.tag} onChange={(e) => updateForm({ tag: e.target.value })} placeholder="Business, Health, Content..." />
            </Field>
          </>
        )}

        {type === 'health' && (
          <>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(e) => updateForm({ date: e.target.value })} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Sleep (hrs)">
                <Input type="number" step="0.5" value={form.sleepHours} onChange={(e) => updateForm({ sleepHours: e.target.value })} />
              </Field>
              <Field label="Weight">
                <Input type="number" step="0.1" value={form.weight} onChange={(e) => updateForm({ weight: e.target.value })} />
              </Field>
              <Field label="Water (cups)">
                <Input type="number" value={form.water} onChange={(e) => updateForm({ water: e.target.value })} />
              </Field>
            </div>
            <Field label={`Mood (${form.mood}/5)`}>
              <input
                type="range"
                min="1"
                max="5"
                value={form.mood}
                onChange={(e) => updateForm({ mood: e.target.value })}
                className="w-full accent-brand-600"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-600 mb-3">
              <input type="checkbox" checked={form.exercise} onChange={(e) => updateForm({ exercise: e.target.checked })} className="rounded accent-brand-600" />
              Exercised today
            </label>
            <Field label="Notes">
              <Textarea rows={2} value={form.notes} onChange={(e) => updateForm({ notes: e.target.value })} />
            </Field>
          </>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary">Add</Button>
        </div>
      </form>
    </Modal>
  )
}
