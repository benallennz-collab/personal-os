import { LayoutDashboard, Target, CalendarDays, HeartPulse, ClipboardList, Lightbulb } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/goals', label: 'Goals & KPIs', icon: Target },
  { to: '/planner', label: 'Weekly Planner', icon: CalendarDays },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/reviews', label: 'Reviews', icon: ClipboardList },
  { to: '/ideas', label: 'Ideas Inbox', icon: Lightbulb },
]
