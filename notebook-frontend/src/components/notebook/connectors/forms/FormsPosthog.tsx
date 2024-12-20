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
  const [baseUrl, setBaseUrl] = useState('https://us.posthog.com')
  const { user } = useUserStore();
  const userId = user?.id || '';
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = () => {
    if (!apiKey.trim()) {
      setError("API Key is required");
      return false;
    }
    if (!baseUrl.trim()) {
      setError("Base URL is required");
      return false;
    }
    setError(null);
    return true;
  };

  const handleConnect = async () => {
    if (!validateForm()) return;
    
    setIsConnecting(true);
    try {
      await posthogSetup(userId, apiKey, baseUrl);
      setError(null);
    } catch (err) {
      setError("Failed to connect to PostHog. Please check your credentials.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (  
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Connect to PostHog</h2>
        <p className="text-muted-foreground">
          Connect PostHog to your notebook to create an AI agent to analyze your data.
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
            className={error ? 'border-red-500' : ''}
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
            className={error ? 'border-red-500' : ''}
          />
          <p className="text-sm text-muted-foreground">
            Default is app.posthog.com. Change only if you are self-hosting PostHog.
          </p>
        </div>
        {error && (
            <p className="text-sm text-red-500 font-medium">
              {error}
            </p>
          )}
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
