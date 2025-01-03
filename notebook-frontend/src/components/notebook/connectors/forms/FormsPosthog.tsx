"use client"

import { useEffect, useState } from 'react'
import { ExternalLinkIcon, Loader2 } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useUserStore, useConnectorsStore } from '@/app/store'
import { useNotebookConnection } from '@/hooks/useNotebookConnection'
import { getApiUrl } from '@/app/lib/config'
import { toast } from '@/hooks/use-toast'

interface FormsPosthogProps {
  onSuccess: () => void;
}


const formSchema = z.object({
  apiKey: z.string().min(30, { message: "API Key is required" }),
  baseUrl: z.string().min(20, { message: "Base URL is required" }),
  userId: z.string().min(5, { message: "User ID is required" })
})

export default function FormsPosthog({onSuccess}: FormsPosthogProps) {
  const { user } = useUserStore();
  const userId = user?.id || '';
  const notebookId = window.location.pathname.split('/').pop()?.split('?')[0] || '';
  console.log("notebookId", notebookId)
  const { createConnector } = useNotebookConnection({
    onConnectorStatus: (status) => {
      console.log("Received connector_status", status)
      toast({
        title: status.success ? "PostHog connected" : "Failed to connect to PostHog",
        description: status.message,
        variant: status.success ? "default" : "destructive"
      })
    },
    onConnectorCreated: (cell) => {
      console.log("Received connector_created", cell)
      //TODO: Handle the connector created event
      //1. Add the connector to the connectors list
      //2. Update the notebook with the new connector
      onSuccess();
      console.log("onSuccess called")
      alert("PostHog connected")


      toast({
        title: "PostHog connected",
        description: "PostHog is now connected to your notebook",
        variant: "default"
      })
    }
  });
  const { connectors } = useConnectorsStore();
  const [isConnecting, setIsConnecting] = useState(false)


  useEffect(() => {
    console.log("connectors", connectors);
  }, [connectors]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: userId,
      apiKey: '',
      baseUrl: 'https://us.posthog.com',
    },
  })

  //TODO: Possibly enable multiple posthog connectors for different API keys. This is a temporary fix to prevent duplicate connectors.
  //If the connector is already in the list, don't add it again
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    setIsConnecting(true);
    
    try {
      const response = await fetch(`${getApiUrl()}/connectors/${userId}/${notebookId}/posthog`);
      console.log("Checking if PostHog is connected", response)
      const data = await response.json();
      const isConnected = JSON.parse(data.body).is_connected;
      console.log("isConnected", isConnected)
      
      if (isConnected) {
        form.setError("root", { message: "PostHog is already connected. Support for multiple connections is in the roadmap. Need this feature now!? Contact us at support@trycosmic.ai" });
        return;
      }
      if (!notebookId) {
        form.setError("root", { message: "Invalid notebook ID" });
        return;
      }
      createConnector(
        'posthog',
        {
          api_key: values.apiKey,
          base_url: values.baseUrl,
        },
        values.userId,
        notebookId
      );
    } catch (err) {
      console.error("Error connecting to PostHog", err)
      form.setError("root", { message: "Failed to connect to PostHog. Please check your credentials." });
    } finally {
      setIsConnecting(false);
    }
  };


  return (  
    
      <Form {...form}>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Connect to PostHog</h2>
            <p className="text-muted-foreground">
              Connect PostHog to your notebook to create an AI agent to analyze your data.
            </p>
          </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PostHog API Key</FormLabel>
                <FormControl>
                  <Input placeholder="phx_1234..." {...field} />
                </FormControl>
                <FormDescription>
                  Find your API key in PostHog under Project Settings → Project API Key. Make sure to select the &quot;Read&quot; permission.
                  <a href="https://us.posthog.com/settings/project-settings/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                    <ExternalLinkIcon className="w-4 h-4 ml-1" />
                  </a>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://us.posthog.com" {...field} />
                </FormControl>
                <FormDescription>
                  Default is us.posthog.com. Change only if you are self-hosting PostHog.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          { form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage> }
          <Button type="submit" disabled={isConnecting}>
            {isConnecting ? <Loader2 className="w-4 h-4 mr-2" /> : null}
            Connect
          </Button>
        </form>
    </Form>
  )
}
