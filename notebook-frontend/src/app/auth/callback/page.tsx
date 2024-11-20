'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session to confirm the user is authenticated
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          // Successfully authenticated
          // You can store any user data in your application state here if needed
          
          // Redirect to your desired page after successful authentication
          router.push('/main'); // or dashboard, home, etc.
        } else {
          // No session found, redirect to sign in
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/signin?error=Authentication failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Completing authentication...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}