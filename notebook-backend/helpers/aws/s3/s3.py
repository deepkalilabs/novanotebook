import boto3
import os
import json
from supabase import create_client, Client

supabase: Client = create_client(
    supabase_url=os.environ.get('SUPABASE_URL'),
    supabase_key=os.environ.get('SUPABASE_SERVICE_KEY')
)
##Init boto3
s3 = boto3.client('s3', 
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_DEFAULT_REGION')
)
bucket_name = 'notebook-lambda-generator'


# TODO: Save the notebook to s3.
def save_or_update_notebook(notebook_id: str, user_id: str, notebook: dict, bucket_name = bucket_name):
    if not notebook_id:
        raise ValueError("Notebook ID is required")
    if not user_id:
        raise ValueError("User ID is required")
    if not notebook:
        raise ValueError("Notebook is required")    
    
    try:
        file_path = f"notebooks/{user_id}/{notebook_id}.json"
        # Check if notebook exists and get its content if it does        
        # Save or update notebook to S3
        aws_response = s3.put_object(Bucket=bucket_name, Key=file_path, Body=json.dumps(notebook))
        print("AWS Response:", aws_response)

        if aws_response['ResponseMetadata']['HTTPStatusCode'] != 200:
            raise Exception("Failed to save notebook to S3")

        # Generate the S3 URL for the object
        url = f"https://{bucket_name}.s3.amazonaws.com/{file_path}"
        
        # Save URL to Supabase based on notebook_id and user_id
        supabase.table('notebooks').upsert({
            'id': notebook_id, 
            'user_id': user_id,
            's3_url': url,
            'updated_at': 'now()'
        }).execute()
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Notebook saved successfully'}),
            'url': url
        }
    except Exception as e:
        print(f"Error saving notebook: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error saving notebook'}),
            'url': None
        }
    
# TODO: Load the notebook from s3.
def load_notebook(filename: str, bucket_name = bucket_name):
    try:
        response = s3.get_object(Bucket=bucket_name, Key=filename)
        print("Response:", response)
        return response.get('Body').read().decode('utf-8')
    except Exception as e:
        print("Error:", e)
        return None
    

# TODO: Delete the notebook from s3.
def delete_notebook(filename: str, bucket_name = bucket_name):
    pass
