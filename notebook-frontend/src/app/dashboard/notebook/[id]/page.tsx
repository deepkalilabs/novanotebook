'use client'

import { use, useEffect } from 'react';
import NotebookPage from '@/components/notebook/NotebookPage';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Notebook({      
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ name?: string }>
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const { id } = resolvedParams;
  const { name } = resolvedSearchParams;
  const router = useRouter();
 

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/signin');
      }
    };

    checkSession();
  }, []);

  return <NotebookPage notebookId={id} name={name || ''} />;
}
