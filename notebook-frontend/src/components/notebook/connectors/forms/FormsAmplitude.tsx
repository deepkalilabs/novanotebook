//Posthog form, inputs are:
// - API key
// - Host URL

import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function FormsAmplitude() {
  const [apiKey, setApiKey] = useState('')
  const [hostUrl, setHostUrl] = useState('')

  return (  
    <div>
      <Input type="text" placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
      <Input type="text" placeholder="Host URL" value={hostUrl} onChange={(e) => setHostUrl(e.target.value)} />
    </div>
  )
}
