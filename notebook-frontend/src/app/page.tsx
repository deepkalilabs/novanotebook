'use client'
import React from 'react';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <YourLogo className="h-12 mx-auto" />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl font-bold tracking-tight">
            Ship an AI Agent in 10 Minutes to Slack or an API
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-muted-foreground">
          From Jupyter Notebook to production in minutes. 
          <br/>For data teams building internal AI tools
          </p>
          
          {/* Email Input and CTA */}
          <div className="flex justify-center max-w-md mx-auto gap-x-4">
            <Link href="/auth/signup">
              <Button variant="default" size="lg">
                Start free trial
              </Button>
            </Link>
          </div>
          
          {/* Terms Text 
          <p className="text-sm text-muted-foreground">
            Try free for 3 days, no credit card required. By entering your email, you agree to receive marketing emails.
          </p>
          */}
        </div>


        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-600 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                How it works
              </div>
              <img src="/demo-visualization.png" alt="Demo visualization" className="rounded-lg" />
              <h3 className="text-xl font-semibold">Upload your data and start asking questions</h3>
              <p className="text-muted-foreground">
                Simply drag and drop your CSV file, then ask questions in natural language to generate visualizations and insights.
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-600 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                How it works
              </div>
              <img src="/demo-visualization.png" alt="Demo visualization" className="rounded-lg" />
              <h3 className="text-xl font-semibold">Upload your data and start asking questions</h3>
              <p className="text-muted-foreground">
                Simply drag and drop your CSV file, then ask questions in natural language to generate visualizations and insights.
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-600 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                How it works
              </div>
              <img src="/demo-visualization.png" alt="Demo visualization" className="rounded-lg" />
              <h3 className="text-xl font-semibold">Upload your data and start asking questions</h3>
              <p className="text-muted-foreground">
                Simply drag and drop your CSV file, then ask questions in natural language to generate visualizations and insights.
              </p>
            </div>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-green-100 w-16 h-16 rounded-xl mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Customizable templates</h3>
              <p className="text-muted-foreground">
                Free website designs to launch your store quickly and easily.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-green-100 w-16 h-16 rounded-xl mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">All in one</h3>
              <p className="text-muted-foreground">
                Takes care of everything from marketing and payments to secure transactions and shipping.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-green-100 w-16 h-16 rounded-xl mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">A safe and efficient platform</h3>
              <p className="text-muted-foreground">
                Millions of users trust us to manage their online stores.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Logos Section */}
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
