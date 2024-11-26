'use client'

import { use, useEffect } from 'react';
import NotebookPage from '@/components/notebook/NotebookPage';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Notebook({      
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/signin');
      }
    };

    checkSession();
  }, []);

  return <NotebookPage notebookId={resolvedParams.id} />;
}