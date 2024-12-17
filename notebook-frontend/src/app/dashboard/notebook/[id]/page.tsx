'use client'

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotebookPage from '@/components/notebook/NotebookPage';
import { Jobs } from '@/app/types';
import { useUserStore } from '@/app/store';
export default function Notebook() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Jobs>({} as Jobs);
  const [userId, setUserId] = useState('');
  const id = params.id as string;
  const name = searchParams.get('name') || '';
  const { user } = useUserStore();

  useEffect(() => {
    const userId = user?.id || '';
    setUserId(userId || '');
  }, []);

  useEffect(() => {
    if (id) {
      const fetchJobs = async () => {
        const response = await fetch(`/api/get_notebook_jobs/${id}`);
        const jobsData = await response.json();
        
        if (jobsData.statusCode !== 200) {
          setJobs({} as Jobs);
      } else {
          console.log('jobsData:', JSON.parse(jobsData.body));
          setJobs(JSON.parse(jobsData.body));
        }
      };

      fetchJobs();
    }
  }, []);

  return (
    <NotebookPage notebookId={id} userId={userId} name={name} jobs={jobs} />
  )
}
