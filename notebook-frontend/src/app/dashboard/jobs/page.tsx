'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader2, AlertCircle, CheckCircle, RefreshCcw, 
  Search, Filter, FileCode, Briefcase 
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/supabase';

const JobStatus = {
  COMPLETED: 'completed',
  RUNNING: 'running',
  ERROR: 'error'
} as const;

type JobStatusType = typeof JobStatus[keyof typeof JobStatus];

interface Job {
  id: string;
  notebook_id: string;
  request_id: string;
  status: JobStatusType;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  completed: boolean;
  error?: string;
  input_params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  created_time: string;
  updated_time: string;
  completed_time?: string;
}

interface GroupedJobs {
  [key: string]: Job[];
}

const JobStatusDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);
  
  useEffect(() => {
    if (userId) {
        fetch(`/api/jobs/${userId}`)
          .then(response => response.json())
          .then(data => {
            const jobsData = data.body ? JSON.parse(data.body).jobs : [];
            const processedJobs = jobsData.map((job: Job) => ({
              ...job,
              status: job.error ? JobStatus.ERROR : 
                     job.completed ? JobStatus.COMPLETED : 
                     JobStatus.RUNNING,
              // Add formatted timestamps
              completed_time: job.completed_at ? new Date(job.completed_at).toLocaleString() : null,
              created_time: new Date(job.created_at).toLocaleString(),
              updated_time: new Date(job.updated_at).toLocaleString(),
            }));
            setJobs(processedJobs);
          })
          .catch(error => console.error('Error fetching jobs:', error));
      }
  }, [userId]);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case JobStatus.COMPLETED:
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Completed',
          className: 'bg-green-500/15 text-green-700 hover:bg-green-500/25'
        };
      case JobStatus.RUNNING:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: 'Running',
          className: 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25'
        };
      case JobStatus.ERROR:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Error',
          className: 'bg-red-500/15 text-red-700 hover:bg-red-500/25'
        };
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDateSection = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return 'This Week';
    } else if (diffDays < 30) {
      return 'This Month';
    } else {
      return 'Older';
    }
  };

  const groupJobsByDate = (jobs: Job[]) => {
    const filtered = jobs.filter((job: Job) => {
      const matchesSearch = (job.notebook_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (job.request_id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.reduce((groups: GroupedJobs, job: Job) => {
      const section = getDateSection(job.created_at || new Date().toISOString());
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(job);
      return groups;
    }, {});
  };

  const groupedJobs = groupJobsByDate(jobs);
  const sections = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older']
    .filter(section => groupedJobs[section]?.length > 0);

  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
            <p className="text-sm text-muted-foreground">Monitor your running jobs and view their status</p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notebooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(JobStatus.COMPLETED)}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(JobStatus.RUNNING)}>Running</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(JobStatus.ERROR)}>Error</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] mt-6">
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section} className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground px-1">{section}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedJobs[section]?.map((job: Job) => {
                  const status = getStatusDetails(job.status);
                  
                  return (
                    <Sheet key={`${job.notebook_id}-${job.request_id}`}>
                      <SheetTrigger asChild>
                        <Card className="relative hover:bg-accent transition-colors cursor-pointer">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-start gap-3">
                                  <Briefcase className="h-5 w-5 text-blue-500 mt-0.5" />
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <CardTitle className="text-base font-medium">
                                        <span className="font-bold">Notebook id:</span> {job.notebook_id}
                                      </CardTitle>
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                      <span className="font-mono"><b>Request id:</b> {job.request_id}</span>
                                      <span className="flex items-center gap-2">
                                        {status?.icon}
                                        <span className="text-sm font-medium">
                                          {job.completed ? 'Completed' : job.error ? 'Error' : 'Running'}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-sm text-muted-foreground">{formatTime(job.created_at)}</span>
                                {status && (
                                  <Badge variant="outline" className={status.className}>
                                    <span className="flex items-center gap-1">
                                      {status.icon}
                                      {status.label}
                                    </span>
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] sm:w-[540px]">
                        <SheetHeader>
                          <SheetTitle>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FileCode className="h-4 w-4 text-blue-500" />
                                {job.notebook_id}
                              </div>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span className="font-mono">{job.request_id}</span>
                                <span>{new Date(job.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </SheetTitle>
                        </SheetHeader>
                        
                        <div className="mt-6 space-y-6">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Status</h3>
                            {status && (
                              <Badge variant="outline" className={status.className}>
                                <span className="flex items-center gap-1">
                                  {status.icon}
                                  {status.label}
                                </span>
                              </Badge>
                            )}
                          </div>

                          <div>
                            <h3 className="text-sm font-medium mb-2">Input Parameters</h3>
                            <pre className="bg-muted rounded-md p-4 text-sm overflow-auto">
                              {JSON.stringify(job.input_params, null, 2)}
                            </pre>
                          </div>

                          {job.result && (
                            <div>
                              <h3 className="text-sm font-medium mb-2">Result</h3>
                              <pre className="bg-muted rounded-md p-4 text-sm overflow-auto">
                                {JSON.stringify(job.result, null, 2)}
                              </pre>
                            </div>
                          )}

                          {job.error && (
                            <div>
                              <h3 className="text-sm font-medium mb-2 text-red-500">Error</h3>
                              <pre className="bg-red-50 text-red-600 rounded-md p-4 text-sm overflow-auto">
                                {job.error}
                              </pre>
                            </div>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default JobStatusDashboard;