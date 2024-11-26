"use client"
import { useEffect } from 'react';
import NotebookPage from '@/components/notebook/NotebookPage';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
export default function Notebook({ params }: { params: { id: string } }) {
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirect('/auth/signin');
      }
    };

    console.log(params.id);
    
    checkAuth();
  }, []);
  

  return (
    <>
      <NotebookPage />
    </>
  )
}
