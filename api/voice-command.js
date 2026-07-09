import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const MODEL = 'claude-haiku-4-5'

const tools = [
  {
    name: 'add_task',
    description: 'Add a new task to the weekly planner for a specific date.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short task description' },
        date: { type: 'string', description: 'ISO date YYYY-MM-DD. Omit to default to today.' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['title'],
    },
  },
  {
    name: 'add_goal',
    description: 'Add a new goal or KPI to track progress toward.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        category: { type: 'string', enum: ['Business', 'Health', 'Finance', 'Personal'] },
        current: { type: 'number', description: 'Current progress value, defaults to 0' },
        target: { type: 'number', description: 'Target value to reach' },
        unit: { type: 'string', description: "Unit label, e.g. '$', 'books', 'km'" },
        deadline: { type: 'string', description: 'ISO date YYYY-MM-DD, optional' },
      },
      required: ['title', 'target'],
    },
  },
  {
    name: 'add_idea',
    description: 'Capture a quick idea in the Ideas Inbox.',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The idea itself' },
        tag: { type: 'string', description: 'Category tag, e.g. Business, Health, Content' },
      },
      required: ['text'],
    },
  },
  {
    name: 'add_health_log',
    description: 'Log a health entry: sleep, weight, water, mood, or exercise for a date (usually today).',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'ISO date YYYY-MM-DD, omit to default to today' },
        sleepHours: { type: 'number' },
        weight: { type: 'number' },
        water: { type: 'number', description: 'Cups of water' },
        mood: { type: 'number', description: 'Mood rating 1-5' },
        exercise: { type: 'boolean' },
        notes: { type: 'string' },
      },
    },
  },
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

async function insertForTool(supabase, userId, toolName, input) {
  const today = todayISO()

  if (toolName === 'add_task') {
    return supabase.from('tasks').insert({
      title: input.title,
      date: input.date || today,
      priority: input.priority || 'medium',
      done: false,
      user_id: userId,
    })
  }
  if (toolName === 'add_goal') {
    return supabase.from('goals').insert({
      title: input.title,
      category: input.category || 'Personal',
      current: input.current ?? 0,
      target: input.target,
      unit: input.unit || '',
      deadline: input.deadline || null,
      user_id: userId,
    })
  }
  if (toolName === 'add_idea') {
    return supabase.from('ideas').insert({
      text: input.text,
      tag: input.tag || 'General',
      status: 'new',
      created_at: today,
      user_id: userId,
    })
  }
  if (toolName === 'add_health_log') {
    return supabase.from('health_logs').insert({
      date: input.date || today,
      sleep_hours: input.sleepHours ?? null,
      weight: input.weight ?? null,
      water: input.water ?? null,
      mood: input.mood ?? null,
      exercise: input.exercise ?? false,
      notes: input.notes || '',
      user_id: userId,
    })
  }
  throw new Error(`Unknown tool: ${toolName}`)
}

function confirmationFor(toolName, input) {
  switch (toolName) {
    case 'add_task':
      return `Added task: ${input.title}`
    case 'add_goal':
      return `Added goal: ${input.title}`
    case 'add_idea':
      return `Saved idea: ${input.text}`
    case 'add_health_log':
      return "Logged today's health entry"
    default:
      return 'Done'
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Voice assistant is not configured yet (missing ANTHROPIC_API_KEY).' })
  }

  const { transcript, accessToken } = req.body || {}
  if (!transcript || !accessToken) {
    return res.status(400).json({ error: 'Missing transcript or accessToken' })
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })

  const { data: userResult, error: userError } = await supabase.auth.getUser(accessToken)
  if (userError || !userResult?.user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' })
  }
  const userId = userResult.user.id

  try {
    const [{ data: goals }, { data: tasks }, { data: ideas }, { data: healthLogs }] = await Promise.all([
      supabase.from('goals').select('title, category, current, target, unit, deadline').eq('user_id', userId),
      supabase
        .from('tasks')
        .select('title, date, done, priority')
        .eq('user_id', userId)
        .order('inserted_at', { ascending: false })
        .limit(20),
      supabase
        .from('ideas')
        .select('text, tag, status')
        .eq('user_id', userId)
        .order('inserted_at', { ascending: false })
        .limit(10),
      supabase
        .from('health_logs')
        .select('date, sleep_hours, weight, water, mood, exercise')
        .eq('user_id', userId)
        .order('inserted_at', { ascending: false })
        .limit(5),
    ])

    const systemPrompt = `You are the voice assistant inside Personal OS, a personal executive dashboard app. Today's date is ${todayISO()}.

Here is the user's current data as JSON:
Goals: ${JSON.stringify(goals ?? [])}
Recent tasks: ${JSON.stringify(tasks ?? [])}
Recent ideas: ${JSON.stringify(ideas ?? [])}
Recent health logs: ${JSON.stringify(healthLogs ?? [])}

If the user's request is an action (adding a task, goal, idea, or health log), call the matching tool with the details they gave you.
If the user is asking a question about their existing data instead, answer directly using the data above. Keep the answer short and conversational — one or two sentences, no markdown, no bullet lists — since it will be read aloud by text-to-speech.`

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages: [{ role: 'user', content: transcript }],
    })

    const toolUse = response.content.find((block) => block.type === 'tool_use')

    if (toolUse) {
      const { error: insertError } = await insertForTool(supabase, userId, toolUse.name, toolUse.input)
      if (insertError) {
        return res.status(500).json({ error: insertError.message })
      }
      return res.status(200).json({ type: 'action', message: confirmationFor(toolUse.name, toolUse.input) })
    }

    const textBlock = response.content.find((block) => block.type === 'text')
    return res.status(200).json({ type: 'answer', message: textBlock?.text ?? "Sorry, I didn't catch that." })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Something went wrong talking to the voice assistant.' })
  }
}
