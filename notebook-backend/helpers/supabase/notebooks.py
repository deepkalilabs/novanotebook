import os
import json
from uuid import UUID
from typing import Dict, Any
import logging
from pydantic import BaseModel
from ..types import SupabaseJobDetails, SupabaseJobList
logger = logging.getLogger(__name__)
from supabase import Client
from helpers.supabase.client import get_supabase_client
supabase: Client = get_supabase_client()

def get_notebook_by_id(notebook_id: str, user_id: str):
    response = supabase.table('notebooks') \
        .select('*') \
        .eq('id', notebook_id) \
        .eq('user_id', user_id) \
        .execute()
    return response.data[0]
