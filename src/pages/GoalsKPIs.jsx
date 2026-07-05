import { useState } from 'react'
import { Plus, Pencil, Trash2, Target } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/FormField'
import { useData } from '../context/DataContext'

const CATEGORY_COLORS = { Business: 'brand', Health: 'green', Finance: 'blue', Personal: 'amber' }

const emptyForm = { title: '', category: 'Personal', current: '', target: '', unit: '', deadline: '' }

export default function GoalsKPIs() {
  const { goals, addGoal, updateGoal, deleteGoal } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (goal) => {
    setEditingId(goal.id)
    setForm({ ...goal })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      category: form.category,
      current: Number(form.current) || 0,
      target: Number(form.target) || 0,
      unit: form.unit,
      deadline: form.deadline,
    }
    if (editingId) {
      updateGoal(editingId, payload)
    } else {
      addGoal(payload)
    }
    setModalOpen(false)
  }

  const sortedGoals = [...goals].sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))

  return (
    <div>
      <PageHeader
        title="Goals & KPIs"
        subtitle="Track progress toward what matters this year"
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title="No goals yet" subtitle="Add your first goal to start tracking progress." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {sortedGoals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0
            return (
              <Card key={g.id} hover className="group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Badge color={CATEGORY_COLORS[g.category] || 'slate'}>{g.category}</Badge>
                    <h3 className="font-semibold text-slate-900 tracking-tight mt-2.5 leading-snug">{g.title}</h3>
                  </div>
                  <div className="flex gap-0.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteGoal(g.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{pct}%</span>
                    <span className="text-slate-400 text-xs tabular-nums mb-1">
                      {g.unit === '$' ? `$${g.current.toLocaleString()} / $${g.target.toLocaleString()}` : `${g.current} / ${g.target} ${g.unit}`}
                    </span>
                  </div>
                  <ProgressBar value={g.current} max={g.target} />
                </div>

                {g.deadline && <p className="text-xs text-slate-400 mt-3.5">Due {new Date(g.deadline).toLocaleDateString()}</p>}
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Goal' : 'Add Goal'}>
        <form onSubmit={handleSubmit}>
          <Field label="Title">
            <Input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Launch new website" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Business</option>
                <option>Health</option>
                <option>Finance</option>
                <option>Personal</option>
              </Select>
            </Field>
            <Field label="Deadline">
              <Input type="date" value={form.deadline || ''} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Current">
              <Input type="number" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
            </Field>
            <Field label="Target">
              <Input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
            </Field>
            <Field label="Unit">
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="$, books..." />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingId ? 'Save' : 'Add Goal'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
