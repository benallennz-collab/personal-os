import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { toISODate } from '../utils/date'

const DataContext = createContext(null)

const identity = (x) => x

const mapHealthLogFromDb = (r) => ({
  id: r.id,
  date: r.date,
  sleepHours: r.sleep_hours,
  weight: r.weight,
  water: r.water,
  mood: r.mood,
  exercise: r.exercise,
  notes: r.notes,
})
const mapHealthLogToDb = (h) => ({
  date: h.date,
  sleep_hours: h.sleepHours,
  weight: h.weight,
  water: h.water,
  mood: h.mood,
  exercise: h.exercise,
  notes: h.notes,
})

const mapReviewFromDb = (r) => ({
  id: r.id,
  weekOf: r.week_of,
  wins: r.wins,
  challenges: r.challenges,
  lessons: r.lessons,
  nextFocus: r.next_focus,
})
const mapReviewToDb = (r) => ({
  week_of: r.weekOf,
  wins: r.wins,
  challenges: r.challenges,
  lessons: r.lessons,
  next_focus: r.nextFocus,
})

const mapIdeaFromDb = (i) => ({ id: i.id, text: i.text, tag: i.tag, status: i.status, createdAt: i.created_at })
const mapIdeaToDb = (i) => ({ text: i.text, tag: i.tag, status: i.status, created_at: i.createdAt })

// One live-synced table: initial fetch + realtime subscription + CRUD, scoped to the signed-in user.
function useSyncedTable(table, userId, { mapFromDb = identity, mapToDb = identity } = {}) {
  const [rows, setRows] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!userId) {
      setRows([])
      setLoaded(false)
      return
    }

    let active = true

    supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .order('inserted_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return
        if (!error && data) setRows(data.map(mapFromDb))
        setLoaded(true)
      })

    const channel = supabase
      .channel(`${table}-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === 'INSERT') {
              const next = mapFromDb(payload.new)
              return prev.some((r) => r.id === next.id) ? prev : [next, ...prev]
            }
            if (payload.eventType === 'UPDATE') {
              const next = mapFromDb(payload.new)
              return prev.map((r) => (r.id === next.id ? next : r))
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((r) => r.id !== payload.old.id)
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [table, userId])

  const add = async (item) => {
    const { data, error } = await supabase
      .from(table)
      .insert({ ...mapToDb(item), user_id: userId })
      .select()
      .single()
    if (!error && data) {
      const mapped = mapFromDb(data)
      setRows((prev) => (prev.some((r) => r.id === mapped.id) ? prev : [mapped, ...prev]))
    }
    return { data, error }
  }

  const update = async (id, patch) => {
    const { data, error } = await supabase.from(table).update(mapToDb(patch)).eq('id', id).select().single()
    if (!error && data) {
      const mapped = mapFromDb(data)
      setRows((prev) => prev.map((r) => (r.id === id ? mapped : r)))
    }
    return { data, error }
  }

  const remove = async (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
    return supabase.from(table).delete().eq('id', id)
  }

  const replaceAll = async (items) => {
    await supabase.from(table).delete().eq('user_id', userId)
    if (items?.length) {
      await supabase.from(table).insert(items.map((i) => ({ ...mapToDb(i), user_id: userId })))
    }
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .order('inserted_at', { ascending: false })
    setRows((data || []).map(mapFromDb))
  }

  return { rows, loaded, add, update, remove, replaceAll }
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const goalsApi = useSyncedTable('goals', userId)
  const tasksApi = useSyncedTable('tasks', userId)
  const healthApi = useSyncedTable('health_logs', userId, { mapFromDb: mapHealthLogFromDb, mapToDb: mapHealthLogToDb })
  const reviewsApi = useSyncedTable('reviews', userId, { mapFromDb: mapReviewFromDb, mapToDb: mapReviewToDb })
  const ideasApi = useSyncedTable('ideas', userId, { mapFromDb: mapIdeaFromDb, mapToDb: mapIdeaToDb })

  const loaded = goalsApi.loaded && tasksApi.loaded && healthApi.loaded && reviewsApi.loaded && ideasApi.loaded

  const api = {
    loaded,

    goals: goalsApi.rows,
    addGoal: (goal) => goalsApi.add(goal),
    updateGoal: (id, patch) => goalsApi.update(id, patch),
    deleteGoal: (id) => goalsApi.remove(id),

    tasks: tasksApi.rows,
    addTask: (task) => tasksApi.add({ date: toISODate(new Date()), done: false, priority: 'medium', ...task }),
    toggleTask: (id) => {
      const t = tasksApi.rows.find((r) => r.id === id)
      if (t) tasksApi.update(id, { done: !t.done })
    },
    updateTask: (id, patch) => tasksApi.update(id, patch),
    deleteTask: (id) => tasksApi.remove(id),

    healthLogs: healthApi.rows,
    addHealthLog: (log) => healthApi.add({ date: toISODate(new Date()), ...log }),
    deleteHealthLog: (id) => healthApi.remove(id),

    reviews: reviewsApi.rows,
    addReview: (review) => reviewsApi.add({ weekOf: toISODate(new Date()), ...review }),
    deleteReview: (id) => reviewsApi.remove(id),

    ideas: ideasApi.rows,
    addIdea: (idea) => ideasApi.add({ status: 'new', createdAt: toISODate(new Date()), ...idea }),
    updateIdea: (id, patch) => ideasApi.update(id, patch),
    deleteIdea: (id) => ideasApi.remove(id),

    exportAll: () => ({
      exportedAt: new Date().toISOString(),
      goals: goalsApi.rows,
      tasks: tasksApi.rows,
      healthLogs: healthApi.rows,
      reviews: reviewsApi.rows,
      ideas: ideasApi.rows,
    }),
    importAll: async (data) => {
      if (Array.isArray(data.goals)) await goalsApi.replaceAll(data.goals)
      if (Array.isArray(data.tasks)) await tasksApi.replaceAll(data.tasks)
      if (Array.isArray(data.healthLogs)) await healthApi.replaceAll(data.healthLogs)
      if (Array.isArray(data.reviews)) await reviewsApi.replaceAll(data.reviews)
      if (Array.isArray(data.ideas)) await ideasApi.replaceAll(data.ideas)
    },
  }

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
