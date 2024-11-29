'use client'

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotebookPage from '@/components/notebook/NotebookPage';

export default function Notebook() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState([]);
  
  const id = params.id as string;
  const name = searchParams.get('name') || '';

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await fetch(`/api/get_notebook_jobs/${id}`);
      const jobsData = await response.json();
      
      if (jobsData.statusCode !== 200) {
        setJobs([]);
      } else {
        console.log('jobsData:', JSON.parse(jobsData.body));
        setJobs(JSON.parse(jobsData.body));
      }
    };

    fetchJobs();
  }, [id]);

  return (
    <NotebookPage notebookId={id} name={name} jobs={jobs} />
  )
}
