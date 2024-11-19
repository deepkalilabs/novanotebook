// src/app/auth/verify-email/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session", session);
        // Start redirect after a brief delay to show success message
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
        
      } catch (error) {
        console.error('Session check error:', error);
        setIsRedirecting(false);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Email Verified</CardTitle>
          <CardDescription className="text-center">
            Your email has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRedirecting ? (
            <div className="space-y-4">
              <Alert variant="default" className="border-green-500 text-green-500">
                <AlertDescription>
                  Email verification successful! You can now sign in to your account.
                </AlertDescription>
              </Alert>
              <div className="flex justify-center items-center space-x-2">
                <Icons.spinner className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Redirecting to sign in...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                You can now proceed to sign in to your account.
              </p>
              <Button
                className="w-full"
                onClick={() => router.push('/auth/signin')}
              >
                Continue to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}