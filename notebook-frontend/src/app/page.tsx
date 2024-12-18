'use client'
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { MessageSquare, Code } from 'lucide-react';
import Link from 'next/link';
import posthog from 'posthog-js';

export default function Home() {


  useEffect(() => {
    posthog.capture('page_view', {
      path: '/',
      user_id: posthog.get_distinct_id(),
      referrer: document.referrer,
    });
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <YourLogo className="h-12 mx-auto" />
          </div>
          <div className="inline-block px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 mb-8">
            ⚡️ From Jupyter Notebook to Production in 10 Minutes
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-bold tracking-tight max-w-4xl">
            Ship an AI workflow to Slack or an API 
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-muted-foreground">
            Turn your notebook into a production AI workflow with one click 
            <br/>No DevOps required
          </p>
          
          {/* Email Input and CTA */}
          <div className="flex justify-center max-w-md mx-auto gap-x-4">
            <Link href="/auth/signup">
              <Button variant="default" size="lg">
                Deploy your first AI workflow
              </Button>
            </Link>
          </div>
        </div>


       
      {/* Deployment Options */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Deploy Anywhere</h2>
          <p className="text-xl text-muted-foreground">Choose how you want to expose your AI agent</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6">
              <MessageSquare className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Slack Bot</h3>
            <p className="text-muted-foreground text-lg">
              Deploy as a Slack bot that your team can interact with directly in their workspace.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
              <Code className="text-purple-600" size={24} />
            </div>
            <h3 className="text-2xl font-semibold mb-4">API Endpoint</h3>
            <p className="text-muted-foreground text-lg">
              Get a REST API endpoint to integrate your agent with any application.
            </p>
          </div>
        </div>
      </section>
       
      {/* CTA Section */}
      <section className="bg-background border-t">
        <div className="container flex flex-col items-center gap-4 py-16 md:py-20">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Ship Your AI Workflow?
          </h2>
          <p className="text-muted-foreground">
            Start with our free tier. No credit card required.
          </p>
          <Link href="/auth/signup">
            <Button variant="default" size="lg">
              Deploy Now
            </Button>
          </Link>
        </div>
      </section>

        {/* Customer Logos Section 
        <div className="max-w-6xl mx-auto mt-20">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
            <img src="/logos/allbirds.svg" alt="Allbirds" className="h-8 object-contain mx-auto" />
            <img src="/logos/clek.svg" alt="Clek" className="h-8 object-contain mx-auto" />
            <img src="/logos/sheertex.svg" alt="Sheertex" className="h-8 object-contain mx-auto" />
            <img src="/logos/monte.svg" alt="Monte" className="h-8 object-contain mx-auto" />
            <img src="/logos/leesa.svg" alt="Leesa" className="h-8 object-contain mx-auto" />
            <img src="/logos/untuckit.svg" alt="Untuckit" className="h-8 object-contain mx-auto" />
          </div>
        </div>
        */}
      </div>
    </div>
  )
}

// Simple logo component - replace with your actual logo
function YourLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 50">
      {/* Replace with your logo SVG */}
      <path
        d="M25 5 L45 45 H35 L31 35 H19 L15 45 H5 L25 5Z M25 15 L20 30 H30 L25 15Z"
        fill="currentColor"
      />
    </svg>
  )
}
