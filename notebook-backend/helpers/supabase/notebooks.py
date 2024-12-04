import os
import json
from uuid import UUID
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

def get_notebook_by_id(notebook_id: str, user_id: str):
    response = supabase.table('notebooks') \
        .select('*') \
        .eq('id', notebook_id) \
        .eq('user_id', user_id) \
        .execute()
    return response.data[0]
