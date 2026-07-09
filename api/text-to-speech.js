import { createClient } from '@supabase/supabase-js'

const VOICE_NAME = 'en-NZ-MollyNeural'

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION } = process.env
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    return res.status(500).json({ error: 'Voice output is not configured yet (missing Azure Speech credentials).' })
  }

  const { text, accessToken } = req.body || {}
  if (!text || !accessToken) {
    return res.status(400).json({ error: 'Missing text or accessToken' })
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
  const { data: userResult, error: userError } = await supabase.auth.getUser(accessToken)
  if (userError || !userResult?.user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' })
  }

  try {
    const tokenRes = await fetch(`https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY },
    })
    if (!tokenRes.ok) {
      throw new Error('Failed to authenticate with Azure Speech — check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.')
    }
    const azureAccessToken = await tokenRes.text()

    const ssml = `<speak version='1.0' xml:lang='en-NZ'><voice xml:lang='en-NZ' xml:gender='Female' name='${VOICE_NAME}'>${escapeXml(text)}</voice></speak>`

    const speechRes = await fetch(`https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${azureAccessToken}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-64kbitrate-mono-mp3',
        'User-Agent': 'PersonalOS',
      },
      body: ssml,
    })

    if (!speechRes.ok) {
      const errText = await speechRes.text()
      throw new Error(`Azure Speech synthesis failed (${speechRes.status}): ${errText}`)
    }

    const audioBuffer = Buffer.from(await speechRes.arrayBuffer())
    res.setHeader('Content-Type', 'audio/mpeg')
    return res.status(200).send(audioBuffer)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Something went wrong generating speech.' })
  }
}
