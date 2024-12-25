# app/services/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import httpx
from datetime import datetime
from typing import Dict, Optional
import os
from dotenv import load_dotenv
from supabase import Client
from helpers.supabase.client import get_supabase_client
from helpers.types import ScheduledJob, NotebookDetails
from typing import List
import uuid
import json
load_dotenv()

class NotebookScheduler:
    _instance = None
    _scheduler = None
    _supabase: Optional[Client] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NotebookScheduler, cls).__new__(cls)
            # Initialize scheduler only once
            cls._scheduler = AsyncIOScheduler()
            cls._scheduler.add_jobstore(
                'sqlalchemy',
                url=os.getenv('SUPABASE_DATABASE_URL')
            )
            # Initialize Supabase
            cls._supabase: Client = get_supabase_client()
        return cls._instance

    def __init__(self):
        self.schedule_configs = {
            'hourly': {'trigger': 'interval', 'hours': 1},
            'daily': {'trigger': 'cron', 'hour': 0, 'minute': 0},
            'weekly': {'trigger': 'cron', 'day_of_week': 0, 'hour': 0, 'minute': 0},
            'monthly': {'trigger': 'cron', 'day': 1, 'hour': 0, 'minute': 0}
        }

    async def _execute_schedule(self, notebook_id: str, schedule_job_id: str):
        """Internal method to execute notebook endpoint"""
        try:
            # Get notebook endpoint from Supabase
            endpoint_result = ''
            response = self._supabase.table('notebooks').eq('id', notebook_id).single().execute()
            input_params = self._supabase.table('schedules').eq('job_id', schedule_job_id).select('input_params').single().execute()

            nb_details = NotebookDetails(**response.data)
            endpoint = nb_details.submit_endpoint
            input_params = json.loads(input_params.data['input_params'])
            
            # Execute the endpoint
            async with httpx.AsyncClient() as client:
                endpoint_result = await client.post(endpoint, json=input_params)
            
            # Update last run timestamp in Supabase
            self._supabase.table('schedules')\
                .update({'last_run_at': datetime.utcnow().isoformat()})\
                .update({'last_run_output': str(endpoint_result)})\
                .eq('job_id', schedule_job_id)\
                .execute()
            
            self._supabase.table('schedules')\
                .update({'next_run_at': self._scheduler.get_job(schedule_job_id).next_run_time.isoformat()})\
                .eq('job_id', schedule_job_id)\
                .execute()
            
            return endpoint_result
                
        except Exception as e:
            print(f"Error executing notebook {notebook_id}: {str(e)}")
            raise

    async def get_schedules(self, notebook_id: str) -> List[ScheduledJob]:
        """Get schedules for a notebook"""
        # TODO: Add input_params
        response = self._supabase.table('schedules')\
            .select('*, notebooks(submit_endpoint)')\
            .eq('notebook_id', notebook_id)\
            .execute()

        # Transform response data into ScheduledJob objects
        schedules = []
        for schedule in response.data:
            schedules.append(ScheduledJob(**{
                'id': schedule['id'],
                'schedule': schedule['schedule'],
                'last_run': schedule.get('last_run_at'),
                'next_run': schedule.get('next_run_at'),
                'input_params': schedule.get('input_params'),
                'last_run_output': schedule.get('last_run_output'),
                'submit_endpoint': schedule['notebooks']['submit_endpoint'],
            }))
        print("schedules", schedules)
        return schedules

    async def create_or_update_schedule(
        self,
        notebook_id: str,
        schedule_details: ScheduledJob,
    ):
        """Create or update a schedule"""
        try:            
            if schedule_details.schedule not in self.schedule_configs:
                raise ValueError(f"Invalid schedule type. Must be one of: {', '.join(self.schedule_configs.keys())}")
            
            # Add job to APScheduler
            schedule_config = self.schedule_configs[schedule_details.schedule]

            print("schedule_config", schedule_config)

            schedule_job_id = str(uuid.uuid4())

            job = self._scheduler.add_job(
                self._execute_schedule,
                **schedule_config,
                args=[notebook_id, schedule_job_id],
                id=schedule_job_id
            )

            self._supabase.table('schedules')\
                .insert({
                    "schedule": schedule_details.schedule,
                    "input_params": json.dumps(schedule_details.input_params),
                    "notebook_id": notebook_id,
                    "last_run_at": datetime.utcnow().isoformat(),
                    "next_run_at": job.next_run_time.isoformat(),
                    "job_id": schedule_job_id
                })\
                .execute()
            
            return {
                'status': 'success',
                'job_id': schedule_job_id,
            }
            
        except Exception as e:
            raise ValueError(f"Failed to schedule job: {str(e)}")
    
    def remove_schedule(self, job_id: str):
        """Remove a schedule"""
        try:
            self._scheduler.remove_job(job_id)
        except Exception as e:
            print(f"Error removing schedule {job_id}: {str(e)}")
            # raise ValueError(f"Failed to remove schedule: {str(e)}")
        
        try:
            self._supabase.table('schedules')\
                .delete()\
                .eq('id', job_id)\
                .execute()
        except Exception as e:
            print(f"Error removing schedule from DB {job_id}: {str(e)}")
            # raise ValueError(f"Failed to remove schedule from DB: {str(e)}")
    
    def start(self):
        """Start the scheduler"""
        if not self._scheduler.running:
            self._scheduler.start()
    
    def shutdown(self):
        """Shutdown the scheduler"""
        if self._scheduler.running:
            self._scheduler.shutdown()