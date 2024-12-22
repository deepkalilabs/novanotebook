import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { NotebookDetails, ScheduledJob } from '@/app/types';
import { Skeleton } from '@/components/ui/skeleton';

interface JobSchedulerProps {
  notebookId: string;
}

export function JobScheduler({ notebookId }: JobSchedulerProps) {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notebookDetails, setNotebookDetails] = useState<NotebookDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const scheduleOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  useEffect(() => {
    Promise.all([
      fetch(`/api/notebook_details/${notebookId}`).then(res => res.json()),
      fetch(`/api/notebook_job_schedule/${notebookId}`).then(res => res.json())
    ])
    .then(([detailsData, jobsData]) => {
      setNotebookDetails(detailsData);
      setJobs(jobsData);
      setLoading(false);
    })
    .catch(error => {
      console.log('Error fetching data:', error);
      setLoading(false);
    });
  }, [notebookId]);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notebook_job_schedule/${notebookId}`, {
        method: 'DELETE',
      });
      
      setJobs(jobs.filter(job => job.id !== id));
      toast({
        title: 'Schedule deleted',
        description: 'Job schedule has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete job schedule',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (job: ScheduledJob) => {
    try {
      console.log("job", job)
      const response = await fetch(`/api/notebook_job_schedule/${notebookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(job),
      });

      if (!response.ok) {
        throw new Error('Failed to update job schedule');
      }
            
      toast({
        title: 'Schedule updated',
        description: 'Job schedule has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update job schedule',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint URI</TableHead>
              <TableHead>Input Parameters</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><Skeleton className="h-[20px] w-full" /></TableCell>
              <TableCell><Skeleton className="h-[20px] w-full" /></TableCell>
              <TableCell><Skeleton className="h-[20px] w-full" /></TableCell>
              <TableCell><Skeleton className="h-[20px] w-full" /></TableCell>
              <TableCell><Skeleton className="h-[20px] w-full" /></TableCell>
              <TableCell><Skeleton className="h-[20px] w-full" /></TableCell>
              <TableCell><Skeleton className="h-[20px] w-full" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Endpoint URI</TableHead>
            <TableHead>Input Parameters</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                {job.submit_endpoint}
              </TableCell>
              <TableCell>
                {editingId === job.id ? (
                  <Input 
                    value={job.input_params} 
                    onChange={(e) => {
                      setJobs(jobs.map(j => 
                        j.id === job.id 
                          ? { ...j, input_params: e.target.value }
                          : j
                      ));
                    }}
                  />
                ) : (
                  typeof job.input_params === 'string' 
                    ? job.input_params 
                    : JSON.stringify(job.input_params)
                )}
              </TableCell>
              <TableCell>
                {editingId === job.id ? (
                  <Select 
                    value={job.schedule}
                    onValueChange={(value: string) => {
                      setJobs(jobs.map(j => 
                        j.id === job.id 
                          ? { ...j, schedule: value }
                          : j
                      ));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : job.schedule}
              </TableCell>
              <TableCell>{job.status || "Active"}</TableCell>
              <TableCell>{job.last_run || 'Never'}</TableCell>
              <TableCell>{job.next_run || 'Not scheduled'}</TableCell>
              <TableCell>
                {editingId === job.id ? (
                  <div className="space-x-2">
                    <Button onClick={() => handleSave(job)}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => handleEdit(job.id)}>Edit</Button>
                    <Button variant="destructive" onClick={() => handleDelete(job.id)}>Delete</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="p-4">
        <Button
          onClick={() => {
            const newJob: ScheduledJob = {
              id: crypto.randomUUID(),
              submit_endpoint: notebookDetails?.submit_endpoint || '',
              input_params: '{}',
              schedule: 'hourly',
            };
            setJobs([...jobs, newJob]);
            setEditingId(newJob.id);
          }}
        >
          Add Schedule
        </Button>
      </div>
    </div>
  );
}