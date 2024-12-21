"use client"

import { useEffect, useState } from 'react'
import { ExternalLinkIcon, Link, Loader2 } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useUserStore, useConnectorsStore } from '@/app/store'

interface FormsPosthogProps {
  posthogSetup: (userId: string, apiKey: string, baseUrl: string) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  apiKey: z.string().min(30, { message: "API Key is required" }),
  baseUrl: z.string().min(20, { message: "Base URL is required" }),
  userId: z.string().min(5, { message: "User ID is required" })
})

export default function FormsPosthog({ posthogSetup, onSuccess }: FormsPosthogProps) {
  const { user } = useUserStore();
  const userId = user?.id || '';
  const { connectors } = useConnectorsStore();
  const [isConnecting, setIsConnecting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: userId,
      apiKey: '',
      baseUrl: 'https://us.posthog.com',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    setIsConnecting(true);

    //TODO: Enable multiple posthog connectors. This is a temporary fix to prevent duplicate connectors.
    //If the connector is already in the list, don't add it again
    if (connectors.find(connector => connector.type === 'posthog')) {
      form.setError("root", { message: "PostHog is already connected." });
      return;
    }

    try {
      console.log("Calling posthogSetup");
      posthogSetup(values.userId, values.apiKey, values.baseUrl);
      onSuccess();
    } catch (err) {
      form.setError("root", { message: "Failed to connect to PostHog. Please check your credentials." });
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    console.log(connectors);
  }, [connectors]);

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
                  Find your API key in PostHog under Project Settings → Project API Key. Make sure to select the "Read" permission.
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
          <Button type="submit" disabled={isConnecting}>
            {isConnecting ? <Loader2 className="w-4 h-4 mr-2" /> : null}
            Connect
          </Button>
        </form>
    </Form>
  )
}
