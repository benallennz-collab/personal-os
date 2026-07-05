import { Target, CalendarCheck2, HeartPulse, Lightbulb, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { useData } from '../context/DataContext'
import { formatFullDate, getWeekDates, toISODate } from '../utils/date'

function StatCard({ icon: Icon, label, value, to, accent }) {
  return (
    <Link to={to} className="block group">
      <Card hover className="h-full">
        <div className="flex items-center justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
            <Icon size={18} />
          </div>
          <ArrowRight size={15} className="text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-3.5 tabular-nums tracking-tight">{value}</p>
        <p className="text-[13px] text-slate-500 mt-0.5">{label}</p>
      </Card>
    </Link>
  )
}

function SectionCard({ title, viewAllTo, viewAllLabel = 'View all', children }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 tracking-tight text-[15px]">{title}</h3>
        <Link to={viewAllTo} className="text-xs font-medium text-brand-600 hover:text-brand-700">{viewAllLabel}</Link>
      </div>
      {children}
    </Card>
  )
}

export default function ExecutiveDashboard() {
  const { goals, tasks, healthLogs, ideas } = useData()

  const weekDates = getWeekDates()
  const weekISOs = weekDates.map(toISODate)
  const weekTasks = tasks.filter((t) => weekISOs.includes(t.date))
  const tasksDone = weekTasks.filter((t) => t.done).length
  const todayTasks = tasks.filter((t) => t.date === toISODate(new Date()))

  const avgGoalProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + Math.min(100, (g.current / (g.target || 1)) * 100), 0) / goals.length)
    : 0

  const latestHealth = [...healthLogs].sort((a, b) => (a.date < b.date ? 1 : -1))[0]
  const newIdeas = ideas.filter((i) => i.status === 'new').length

  return (
    <div>
      <PageHeader title="Executive Dashboard" subtitle={formatFullDate(new Date())} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <StatCard icon={Target} label="Avg. goal progress" value={`${avgGoalProgress}%`} to="/goals" accent="bg-brand-50 text-brand-600" />
        <StatCard icon={CalendarCheck2} label="Tasks done this week" value={`${tasksDone}/${weekTasks.length}`} to="/planner" accent="bg-emerald-50 text-emerald-600" />
        <StatCard icon={HeartPulse} label="Latest sleep (hrs)" value={latestHealth?.sleepHours ?? '—'} to="/health" accent="bg-rose-50 text-rose-600" />
        <StatCard icon={Lightbulb} label="New ideas" value={newIdeas} to="/ideas" accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <SectionCard title="Goal Progress" viewAllTo="/goals">
          {goals.length === 0 ? (
            <EmptyState icon={Target} title="No goals yet" subtitle="Add one from Quick Add." />
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 4).map((g) => (
                <div key={g.id}>
                  <div className="flex justify-between items-baseline text-sm mb-1.5">
                    <span className="font-medium text-slate-700 truncate pr-2">{g.title}</span>
                    <span className="text-slate-400 text-xs tabular-nums shrink-0">
                      {g.unit === '$' ? `$${g.current.toLocaleString()} / $${g.target.toLocaleString()}` : `${g.current} / ${g.target} ${g.unit}`}
                    </span>
                  </div>
                  <ProgressBar value={g.current} max={g.target} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Today's Tasks" viewAllTo="/planner" viewAllLabel="View planner">
          {todayTasks.length === 0 ? (
            <EmptyState icon={CalendarCheck2} title="Nothing scheduled today" subtitle="Enjoy the clear runway, or add a task." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {todayTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2.5 text-sm py-2.5 first:pt-0 last:pb-0">
                  {t.done ? <CheckCircle2 size={17} className="text-emerald-500 shrink-0" /> : <Circle size={17} className="text-slate-300 shrink-0" />}
                  <span className={`flex-1 truncate ${t.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{t.title}</span>
                  <Badge color={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'amber' : 'slate'}>{t.priority}</Badge>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Ideas" viewAllTo="/ideas" viewAllLabel="Open inbox">
          {ideas.length === 0 ? (
            <EmptyState icon={Lightbulb} title="Inbox is empty" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {ideas.slice(0, 4).map((idea) => (
                <li key={idea.id} className="flex items-start gap-2.5 text-sm text-slate-700 py-2.5 first:pt-0 last:pb-0">
                  <Lightbulb size={15} className="text-amber-500 mt-0.5 shrink-0" />
                  <span className="flex-1">{idea.text}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Health Snapshot" viewAllTo="/health" viewAllLabel="Full dashboard">
          {!latestHealth ? (
            <EmptyState icon={HeartPulse} title="No health logs yet" />
          ) : (
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Sleep</p>
                <p className="font-semibold text-slate-800 tabular-nums">{latestHealth.sleepHours ?? '—'} hrs</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Weight</p>
                <p className="font-semibold text-slate-800 tabular-nums">{latestHealth.weight ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Water</p>
                <p className="font-semibold text-slate-800 tabular-nums">{latestHealth.water ?? '—'} cups</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Mood</p>
                <p className="font-semibold text-slate-800 tabular-nums">{latestHealth.mood ?? '—'}/5</p>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
