# status_handler.py
import os
import json
from typing import Dict, Any
from supabase import create_client, Client
import logging
from pydantic import BaseModel
from dotenv import load_dotenv
from ..types import SupabaseJobDetails, SupabaseJobList
load_dotenv()
logger = logging.getLogger(__name__)

supabase: Client = create_client(
    supabase_url=os.environ.get('SUPABASE_URL'),
    supabase_key=os.environ.get('SUPABASE_SERVICE_KEY')
)


def get_all_jobs_for_user(user_id: int):
    try:
        response = supabase.table('lambda_jobs') \
            .select('request_id,input_params,completed,result,created_at,updated_at,completed_at,error') \
            .eq('user_id', user_id) \
            .execute()
            
        if response.data:
            all_jobs = [SupabaseJobDetails(**job) for job in response.data]
            return {
                'statusCode': 200,
                'body': SupabaseJobList(jobs=all_jobs).model_dump()
            }
        else:
            return {
                'statusCode': 200,
                'body': json.dumps(SupabaseJobList(jobs=[]).model_dump())
            }
    except Exception as e:
        logger.error(f"Error getting all jobs for user {user_id}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def get_job_by_request_id(request_id: str, user_id: int):
    try:
        response = supabase.table('lambda_jobs') \
            .select('request_id,input_params,completed,result,created_at,updated_at,completed_at,error') \
            .eq('request_id', request_id) \
            .eq('user_id', user_id) \
            .single() \
            .execute()
            
        if response.data:
            return {
                'statusCode': 200,
                'body': SupabaseJobDetails(**response.data).model_dump()
            }
        else:
            logger.warning(f"Job not found: {request_id}")
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Job not found'
                })
            }

    except Exception as e:
        logger.error(f"Error getting job by request ID: {request_id} for user {user_id}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

    
