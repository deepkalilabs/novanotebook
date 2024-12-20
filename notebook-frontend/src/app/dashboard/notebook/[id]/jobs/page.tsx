'use client'

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Jobs } from '@/app/types';
import JobsPage from '@/components/notebook/jobs/JobsPage'; 


export default function Page() {
    const params = useParams();
    const id = params.id as string;
  const [jobs, setJobs] = useState<Jobs>({} as Jobs);
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
    <div>
      <JobsPage jobs={jobs} />
    </div>
  );
}
