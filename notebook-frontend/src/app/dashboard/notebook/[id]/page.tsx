'use client'

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotebookPage from '@/components/notebook/NotebookPage';
import { Jobs } from '@/app/types';

export default function Notebook() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Jobs>({} as Jobs);
  const [userId, setUserId] = useState('');
  const id = params.id as string;
  const name = searchParams.get('name') || '';
  //Get user id from local storage

  useEffect(() => {
    // Move localStorage access into useEffect
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    setUserId(userId || '');
  }, []);

  useEffect(() => {
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
  }, [id]);

  return (
    <NotebookPage notebookId={id} userId={userId} name={name} jobs={jobs} />
  )
}
