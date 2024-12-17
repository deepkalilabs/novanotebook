def lambda_handler(event, context):
    import json
    import logging
    import os
    import uuid
    from datetime import datetime
    from supabase import create_client, Client
    from dotenv import load_dotenv
    load_dotenv()
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    
    SUPABASE_URL=os.environ.get('SUPABASE_URL')
    SUPABASE_SERVICE_KEY=os.environ.get('SUPABASE_SERVICE_KEY')
    
    supabase: Client = create_client(
        supabase_url=SUPABASE_URL,
        supabase_key=SUPABASE_SERVICE_KEY
    )
    
    try:
        logger.info(f"Event: {json.dumps(event, indent=2)}")
        
        # Extract request ID and body from API Gateway event
        request_id = event.get('request_id')
        notebook_id = event.get('notebook_id')
        body = event.get('body')
        
        supabase.table('lambda_jobs').insert({
            'request_id': request_id,
            'created_at': datetime.now().isoformat(),
            'status': 'PROCESSING',
            'completed': False,
            'notebook_id': notebook_id
        }).execute()
        
        if not isinstance(body, dict):
            try:
                body = json.loads(body)
            except json.JSONDecodeError:
                logger.error("Invalid JSON in request body")
                return {'request_id': request_id, 'status': 'FAILED', 'error': 'Invalid JSON'}

        try:
            # Validate parameters using Pydantic
            params = EntrypointParams(**body)
            # Process the request
            try:
                result = entrypoint(params)
                
                # Update job with success status
                supabase.table('lambda_jobs').update({
                    'completed': True,
                    'status': 'COMPLETED',
                    'result': result,
                    'input_params': params.model_dump(),
                    'updated_at': datetime.now().isoformat(),
                    'completed_at': datetime.now().isoformat(),
                    'error': None
                }).eq('request_id', request_id).execute()
                
                logger.info(f'Job {request_id} completed successfully')
                return {'request_id': request_id, 'status': 'COMPLETED'}
                
            except Exception as process_error:
                error_msg = str(process_error)
                logger.error(f"Processing error for job {request_id}: {error_msg}")
                
                # Update job with error status
                supabase.table('lambda_jobs').update({
                    'completed': True,
                    'status': 'FAILED',
                    'error': error_msg,
                    'updated_at': datetime.now().isoformat()
                }).eq('request_id', request_id).execute()
                
                return {'request_id': request_id, 'status': 'FAILED', 'error': error_msg}
                
        except Exception as validation_error:
            error_msg = f"Validation error: {str(validation_error)}"
            logger.error(error_msg)
            return {'request_id': request_id, 'status': 'FAILED', 'error': error_msg}
            
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(error_msg)
        return {'request_id': request_id, 'status': 'FAILED', 'error': error_msg}