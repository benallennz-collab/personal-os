const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Returns array of 7 Date objects for the Mon-Sun week containing `date`.
export function getWeekDates(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    return dt
  })
}

export function toISODate(date) {
  const d = new Date(date)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

export function formatDateLabel(date) {
  const d = new Date(date)
  return `${DAY_SHORT[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
}

export function formatFullDate(date) {
  const d = new Date(date)
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function dayName(date) {
  return DAY_NAMES[new Date(date).getDay()]
}

export function isToday(date) {
  return toISODate(date) === toISODate(new Date())
}

export function weekRangeLabel(weekDates) {
  const start = weekDates[0]
  const end = weekDates[6]
  const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startLabel} – ${endLabel}`
}
