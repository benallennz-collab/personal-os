import { useMemo, useState } from 'react'
import { Plus, Trash2, Lightbulb, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../components/ui/FormField'
import { useData } from '../context/DataContext'
import { formatDateLabel } from '../utils/date'

const STATUS_OPTIONS = ['new', 'considering', 'archived']
const STATUS_DOT = { new: 'bg-brand-500', considering: 'bg-amber-500', archived: 'bg-slate-300' }

const emptyForm = { text: '', tag: '' }

export default function IdeasInbox() {
  const { ideas, addIdea, updateIdea, deleteIdea } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return [...ideas]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .filter((i) => (statusFilter === 'all' ? true : i.status === statusFilter))
      .filter((i) => i.text.toLowerCase().includes(search.toLowerCase()) || i.tag?.toLowerCase().includes(search.toLowerCase()))
  }, [ideas, search, statusFilter])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.text.trim()) return
    addIdea({ text: form.text.trim(), tag: form.tag.trim() || 'General', status: 'new' })
    setForm(emptyForm)
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Ideas Inbox"
        subtitle="Capture first, decide later"
        action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add Idea</Button>}
      />

      <Card padding={false} className="p-2.5 mb-5 sm:mb-6 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ideas or tags..." className="pl-9 !border-transparent !bg-slate-50 focus:!bg-white" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44 !border-transparent !bg-slate-50 focus:!bg-white">
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </Select>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Lightbulb} title="No ideas found" subtitle="Try a different search or add a new idea." />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((idea) => (
            <Card key={idea.id} hover className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 leading-relaxed">{idea.text}</p>
                <div className="flex items-center gap-2 mt-2.5">
                  <Badge color="slate">{idea.tag}</Badge>
                  <span className="text-xs text-slate-400">{formatDateLabel(idea.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${STATUS_DOT[idea.status]}`} />
                  <Select
                    value={idea.status}
                    onChange={(e) => updateIdea(idea.id, { status: e.target.value })}
                    className="!py-1.5 !pl-6 !pr-7 !text-xs !w-[8.5rem] !rounded-lg"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                    ))}
                  </Select>
                </div>
                <button onClick={() => deleteIdea(idea.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Idea">
        <form onSubmit={handleSubmit}>
          <Field label="Idea">
            <Textarea autoFocus rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Capture the idea..." />
          </Field>
          <Field label="Tag">
            <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Business, Health, Content..." />
          </Field>
          <div className="flex justify-end gap-2 mt-5">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Idea</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
