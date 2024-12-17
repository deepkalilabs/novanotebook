"use client"

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useUserStore } from '@/app/store'

interface FormsPosthogProps {
  posthogSetup: (userId: string, apiKey: string, baseUrl: string) => void;
}

export default function FormsPosthog({ posthogSetup }: FormsPosthogProps) {
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://app.posthog.com')
  const { user } = useUserStore();
  const userId = user?.id || '';
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async (e: React.FormEvent<HTMLButtonElement>) => {
    console.log('Connecting to PostHog...')
    e.preventDefault()
    setIsConnecting(true)
    posthogSetup(userId, apiKey, baseUrl)
    setIsConnecting(false)
  }

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
          <label className="font-medium">Base URL</label>
          <Input 
            type="text" 
            value={baseUrl} 
            onChange={(e) => setBaseUrl(e.target.value)} 
          />
          <p className="text-sm text-muted-foreground">
            Default is app.posthog.com. Change only if you are self-hosting PostHog.
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className="mr-2">Connect</span>}
        </Button>
      </div>
    </div>
  )
}
