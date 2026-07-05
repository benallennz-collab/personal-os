import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Input, Select } from '../components/ui/FormField'
import { useData } from '../context/DataContext'
import { getWeekDates, toISODate, formatDateLabel, isToday, weekRangeLabel, dayName } from '../utils/date'

const PRIORITY_COLOR = { high: 'red', medium: 'amber', low: 'slate' }

function DayColumn({ date, tasks, onToggle, onDelete, onAdd }) {
  const iso = toISODate(date)
  const today = isToday(date)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), date: iso, priority, done: false })
    setTitle('')
  }

  return (
    <Card
      className={`group flex flex-col ${today ? 'ring-1 ring-brand-300 bg-brand-50/30' : ''}`}
    >
      <div className="flex items-baseline justify-between mb-3">
        <p className={`font-semibold text-sm tracking-tight ${today ? 'text-brand-700' : 'text-slate-800'}`}>{dayName(date)}</p>
        <p className={`text-xs ${today ? 'text-brand-500 font-medium' : 'text-slate-400'}`}>{formatDateLabel(date)}</p>
      </div>

      <ul className="space-y-1.5 mb-3 min-h-[1.5rem] flex-1">
        {tasks.length === 0 && <li className="text-xs text-slate-300 italic">No tasks</li>}
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <button onClick={() => onToggle(t.id)} className="shrink-0">
              {t.done ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-300" />}
            </button>
            <span className={`flex-1 text-sm truncate ${t.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{t.title}</span>
            <Badge color={PRIORITY_COLOR[t.priority]}>{t.priority[0].toUpperCase()}</Badge>
            <button
              onClick={() => onDelete(t.id)}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-300 hover:text-red-500 shrink-0 transition-opacity"
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="flex gap-1.5">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add task" className="!py-1.5 !px-2.5 !text-xs !rounded-lg" />
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="!py-1.5 !px-2 !text-xs !w-16 !rounded-lg shrink-0">
          <option value="low">Low</option>
          <option value="medium">Med</option>
          <option value="high">High</option>
        </Select>
        <button
          type="submit"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        >
          <Plus size={15} />
        </button>
      </form>
    </Card>
  )
}

export default function WeeklyPlanner() {
  const { tasks, addTask, toggleTask, deleteTask } = useData()
  const [weekOffset, setWeekOffset] = useState(0)

  const weekDates = useMemo(() => {
    const base = new Date()
    base.setDate(base.getDate() + weekOffset * 7)
    return getWeekDates(base)
  }, [weekOffset])

  const weekISOs = weekDates.map(toISODate)
  const weekTasks = tasks.filter((t) => weekISOs.includes(t.date))
  const done = weekTasks.filter((t) => t.done).length

  return (
    <div>
      <PageHeader
        title="Weekly Planner"
        subtitle={`${weekRangeLabel(weekDates)} · ${done}/${weekTasks.length} tasks done`}
        action={
          <div className="flex items-center gap-1.5">
            <Button variant="secondary" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week"><ChevronLeft size={16} /></Button>
            <Button variant="secondary" onClick={() => setWeekOffset(0)}>Today</Button>
            <Button variant="secondary" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week"><ChevronRight size={16} /></Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {weekDates.map((date) => (
          <DayColumn
            key={toISODate(date)}
            date={date}
            tasks={tasks.filter((t) => t.date === toISODate(date))}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAdd={addTask}
          />
        ))}
      </div>
    </div>
  )
}
