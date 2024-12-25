import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Jobs } from "@/app/types";
import { useState, useEffect } from "react";

interface JobsPageProps {
  jobs?: Jobs;
}

export function JobsPage({ jobs }: JobsPageProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Completed</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
          { !jobs?.jobs ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                Loading jobs...
              </TableCell>
            </TableRow>
          ) : jobs?.jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                No jobs found.
              </TableCell>
            </TableRow>
          ) : (
            [...jobs.jobs]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((job) => (
                <TableRow key={job.request_id}>
                  <TableCell className="font-mono">{job.request_id}</TableCell>
                  <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                job.completed ? 'bg-green-100 text-green-800' : 
                job.error ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {job.completed ? 'Completed' : job.error ? 'Failed' : 'Running'}
              </span>
            </TableCell>
            <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
              <TableCell>{job.completed_at ? new Date(job.completed_at).toLocaleString() : '-'}</TableCell>
            </TableRow>
          ))
        )}
        </TableBody>
      </Table>
    </div>
  );
}