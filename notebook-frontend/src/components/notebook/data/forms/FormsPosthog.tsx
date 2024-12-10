//Posthog form, inputs are:
// - API key
// - Host URL

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function FormsPosthog() {
  const [apiKey, setApiKey] = useState('')
  const [hostUrl, setHostUrl] = useState('https://app.posthog.com')

  return (  
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Connect to PostHog</h2>
        <p className="text-muted-foreground">
          Connect your PostHog instance to analyze user behavior and predict churn.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="font-medium">PostHog API Key</label>
          <Input 
            type="text" 
            placeholder="phx_1234..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
          <p className="text-sm text-muted-foreground">
            Find your API key in PostHog under Project Settings → Project API Key
          </p>
        </div>

        <div className="space-y-2">
          <label className="font-medium">Host URL</label>
          <Input 
            type="text" 
            value={hostUrl} 
            onChange={(e) => setHostUrl(e.target.value)} 
          />
          <p className="text-sm text-muted-foreground">
            Default is app.posthog.com. Change only if you're self-hosting PostHog.
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>
          <span className="mr-2">Connect</span>
        </Button>
      </div>
    </div>
  )
}
