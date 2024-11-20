// src/app/auth/signin/page.tsx
'use client';
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from '@/lib/supabase'
import { AuthError } from '@supabase/supabase-js'

interface SignInData {
  email: string
  password: string
}

export default function SignIn() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;
      debugger;

      if (data?.session) {
        // Successful login
        router.push('/main'); // or wherever you want to redirect after login
        router.refresh(); // Refresh the page to update the session
      }
    } catch (error) {
      const err = error as AuthError;
      setError(err.message || "Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) throw error;
    } catch (error) {
      const err = error as AuthError;
      setError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleEmailSignin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                value={formData.email}
                onChange={(e) => {
                  setError(null);
                  setFormData({ ...formData, email: e.target.value });
                }}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                required
                placeholder="********"
                value={formData.password}
                onChange={(e) => {
                  setError(null);
                  setFormData({ ...formData, password: e.target.value });
                }}
                disabled={isLoading}
              />
            </div>
            {error && (
              <Alert variant={error.includes("reset") ? "default" : "destructive"}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignin}
              className="w-full"
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Google
            </Button>
          </CardFooter>
        </form>
        <div className="text-center text-sm text-muted-foreground mb-6">
          Don't have an account?{" "}
          <Button variant="link" asChild className="px-2 text-sm underline-offset-4 hover:underline">
            <Link href="/auth/signup">
              Sign up
            </Link>
          </Button>
          <br/>
          Forgot password?{" "}
          <Button variant="link" asChild className="px-2 text-sm underline-offset-4 hover:underline">
            <Link href="/auth/reset-password">
              Reset password
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}