'use client'

import { use, useEffect } from 'react';
import NotebookPage from '@/components/notebook/NotebookPage';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Notebook({      
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  // const supabase = createClientComponentClient();
  // const { data: { session }, error } = await supabase.auth.getSession();

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