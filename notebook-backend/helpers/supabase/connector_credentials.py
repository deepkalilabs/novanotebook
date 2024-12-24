import json
from supabase import Client
import logging
from helpers.supabase.client import get_supabase_client
from helpers.types import SupabaseConnectorCredential, SupabaseConnectorCredentialList
logger = logging.getLogger(__name__)
supabase: Client = get_supabase_client()

def get_connector_credentials(user_id: str, notebook_id: str):
    print('user_id', user_id)
    print('notebook_id', notebook_id)

    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'User ID are required'}),
            'message': 'User ID are required'
        }
    
    if not notebook_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Notebook ID is required'}),
            'message': 'Notebook ID is required'
        }
    
    try:
        response = supabase.table('connector_credentials') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('notebook_id', notebook_id) \
            .execute()
    
        credentials = [SupabaseConnectorCredential(**credential) for credential in response.data]
        credential_list = SupabaseConnectorCredentialList(credentials=credentials)
        print(credential_list)
        
        return {
            'statusCode': 200,
            'body': json.dumps(credential_list.model_dump()),
            'message': 'Successfully retrieved connector credentials'
        }
    except Exception as e:
        logger.error(f"Error getting all jobs for user {user_id}: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'message': 'Error getting connector credentials'
        }



def create_connector_credentials(user_id: str, notebook_id: str, connector_type: str, credentials: dict):
    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'User ID is required'}),
            'message': 'User ID is required'
        }
    
    if not notebook_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Notebook ID is required'}),
            'message': 'Notebook ID is required'
        }
    
    if not connector_type:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Connector type is required'}),
            'message': 'Connector type is required'
        }
    
    if not credentials:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Credentials are required'}),
            'message': 'Credentials are required'
        }
    
    try:
        response = supabase.table('connector_credentials') \
            .upsert({
                'user_id': user_id,
                'notebook_id': notebook_id,
                'connector_type': connector_type,
                'credentials': credentials
            }) \
            .execute()
        
        return {
            'statusCode': 200,
            'body': json.dumps(response.data),
            'message': 'Connector credentials created successfully'
        }
    except Exception as e:
        logger.error(f"Error creating connector credentials: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'message': 'Error creating connector credentials'
        }

def delete_connector_credentials(id: str):
    if not id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'ID is required'}),
            'message': 'ID is required'
        }
    
    try:
        response = supabase.table('connect_credentials') \
            .delete() \
            .eq('id', id) \
            .execute()
        
        return {
            'statusCode': 200,
            'body': json.dumps(response.data),
            'message': 'Connector credentials deleted successfully'
        }
    except Exception as e:
        logger.error(f"Error deleting connector credentials: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'message': 'Error deleting connector credentials'
        }
    

def get_is_type_connected(user_id: str, notebook_id: str, type: str):
    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'User ID is required'}),
            'message': 'User ID is required'
        }
    
    if not notebook_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Notebook ID is required'}),
            'message': 'Notebook ID is required'
        }
    
    if not type:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Type is required'}),
            'message': 'Type is required'
        }
    
    try:
        response = supabase.table('connector_credentials') \
            .select('id') \
            .eq('user_id', user_id) \
            .eq('notebook_id', notebook_id) \
            .eq('connector_type', type) \
            .limit(1) \
            .execute()
        
        return {
            'statusCode': 200,
            'body': json.dumps({'is_connected': len(response.data) > 0}),
            'message': 'Successfully retrieved connector credentials'
        }
    except Exception as e:
        logger.error(f"Error checking connector connection: {str(e)}")
        return False