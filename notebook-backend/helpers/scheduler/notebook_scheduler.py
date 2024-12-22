# app/services/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import httpx
from datetime import datetime
from typing import Dict, Optional
import os
from dotenv import load_dotenv
from supabase import Client
from helpers.supabase.client import get_supabase_client
from helpers.types import ScheduledJob
from typing import List
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
        pass

    async def _execute_notebook(self, notebook_id: str):
        """Internal method to execute notebook endpoint"""
        try:
            # Get notebook endpoint from Supabase
            response = self._supabase.table('notebooks').select('submit_endpoint').eq('id', notebook_id).single().execute()
            endpoint = response.data['submit_endpoint']
            
            # Execute the endpoint
            async with httpx.AsyncClient() as client:
                await client.post(endpoint)
            
            # Update last run timestamp in Supabase
            self._supabase.table('schedules')\
                .update({'last_run_at': datetime.utcnow().isoformat()})\
                .eq('notebook_id', notebook_id)\
                .execute()
            
            self._supabase.table('schedules')\
                .update({'next_run_at': datetime.utcnow().isoformat()})\
                .eq('notebook_id', notebook_id)\
                .execute()
                
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
                'submit_endpoint': schedule['notebooks']['submit_endpoint'],
            }))
        print("schedules", schedules)
        return schedules

    async def create_or_update_schedule(
        self,
        notebook_id: str,
        schedule_type: str,
        input_params: Dict,
        schedule_id: Optional[str] = None
    ):
        """Create or update a schedule"""
        try:
            if schedule_id:
                self._scheduler.remove_job(schedule_id)
            
            job_kwargs = {
                'func': self._execute_notebook,
                'trigger': schedule_type,
                'kwargs': {'notebook_id': notebook_id},
                'misfire_grace_time': 3600,
                'coalesce': True
            }
            
            job_kwargs.update(
                hour=input_params.get('hour'),
                minute=input_params.get('minute'),
                day=input_params.get('day'),
                month=input_params.get('month'),
                day_of_week=input_params.get('day_of_week')
            )
            
            job = self._scheduler.add_job(**job_kwargs)
            
            # Update Supabase with schedule details
            schedule_data = {
                'notebook_id': notebook_id,
                'schedule_type': schedule_type,
                'input_params': input_params,
                'next_run_at': job.next_run_time.isoformat() if job.next_run_time else None
            }

            if schedule_id:
                self._supabase.table('schedules')\
                    .update(schedule_data)\
                    .eq('id', schedule_id)\
                    .execute()
            else:
                self._supabase.table('schedules')\
                    .insert(schedule_data)\
                    .execute()
            
            return {
                'job_id': job.id,
                'next_run_time': job.next_run_time
            }
            
        except Exception as e:
            raise ValueError(f"Failed to schedule job: {str(e)}")
    
    def remove_schedule(self, job_id: str):
        """Remove a schedule"""
        try:
            self._scheduler.remove_job(job_id)
            self._supabase.table('schedules')\
                .delete()\
                .eq('id', job_id)\
                .execute()
        except Exception as e:
            raise ValueError(f"Failed to remove schedule: {str(e)}")
    
    def start(self):
        """Start the scheduler"""
        if not self._scheduler.running:
            self._scheduler.start()
    
    def shutdown(self):
        """Shutdown the scheduler"""
        if self._scheduler.running:
            self._scheduler.shutdown()