'use client'

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotebookPage from '@/components/notebook/NotebookPage';
import { useUserStore } from '@/app/store';
export default function Notebook() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState('');
  const id = params.id as string;
  const name = searchParams.get('name') || '';
  const { user } = useUserStore();

  useEffect(() => {
    const userId = user?.id || '';
    setUserId(userId || '');
  }, []);

  return (
    <NotebookPage notebookId={id} userId={userId} name={name}/>
  )
}
