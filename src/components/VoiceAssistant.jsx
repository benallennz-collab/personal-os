import { useEffect, useRef, useState } from 'react'
import { Mic, Loader2, AlertCircle } from 'lucide-react'
import Modal from './ui/Modal'
import { supabase } from '../lib/supabaseClient'

const BrowserSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function VoiceAssistant({ open, onClose }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('idle') // idle | listening | thinking | done | error
  const [result, setResult] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!open) {
      recognitionRef.current?.stop()
      setListening(false)
      setTranscript('')
      setResult(null)
      setStatus('idle')
    }
  }, [open])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  const startListening = () => {
    if (!BrowserSpeechRecognition) {
      setStatus('error')
      setResult({ error: true, message: 'Voice input is not supported in this browser. Try Chrome on desktop or Android.' })
      return
    }
    const recognition = new BrowserSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')
      setTranscript(text)
    }
    recognition.onerror = () => {
      setListening(false)
      setStatus('idle')
    }

    recognitionRef.current = recognition
    setTranscript('')
    setResult(null)
    setStatus('listening')
    setListening(true)
    recognition.start()
  }

  const speak = (text) => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  const stopAndSend = async () => {
    recognitionRef.current?.stop()
    setListening(false)

    const spoken = transcript.trim()
    if (!spoken) {
      setStatus('idle')
      return
    }

    setStatus('thinking')
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: spoken, accessToken: session?.access_token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      setResult({ error: false, message: data.message })
      setStatus('done')
      speak(data.message)
    } catch (err) {
      setResult({ error: true, message: err.message })
      setStatus('error')
    }
  }

  const handleClose = () => {
    window.speechSynthesis?.cancel()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Voice Assistant">
      <div className="flex flex-col items-center py-2">
        <button
          onClick={listening ? stopAndSend : startListening}
          disabled={status === 'thinking'}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 disabled:opacity-60 ${
            listening
              ? 'bg-red-500 shadow-red-500/30 animate-pulse'
              : 'bg-gradient-to-br from-brand-500 to-brand-700 shadow-brand-900/25'
          } text-white`}
        >
          {status === 'thinking' ? <Loader2 size={26} className="animate-spin" /> : <Mic size={26} />}
        </button>

        <p className="text-sm text-slate-500 mt-3 text-center">
          {status === 'listening' && 'Listening — tap to finish'}
          {status === 'thinking' && 'Thinking…'}
          {status === 'idle' && 'Tap the mic and speak — try "add a task to call the dentist tomorrow" or "what\'s on my plate today?"'}
          {(status === 'done' || status === 'error') && 'Tap the mic to ask something else'}
        </p>

        {transcript && (status === 'listening' || status === 'thinking') && (
          <p className="text-sm text-slate-700 mt-4 text-center italic">&ldquo;{transcript}&rdquo;</p>
        )}

        {result && (
          <div
            className={`flex items-start gap-2 mt-4 w-full px-4 py-3 rounded-xl text-sm ${
              result.error ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'
            }`}
          >
            {result.error && <AlertCircle size={15} className="mt-0.5 shrink-0" />}
            <span>{result.message}</span>
          </div>
        )}
      </div>
    </Modal>
  )
}
