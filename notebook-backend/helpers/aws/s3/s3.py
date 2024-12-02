import boto3
import os
from dotenv import load_dotenv
from pathlib import Path
import json
import logging
import subprocess

logger = logging.getLogger(__name__)

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent.parent / '.env'
print(f"Looking for .env file at: {env_path.absolute()}")
load_dotenv(env_path)

##Init boto3
bucket_name = 'notebook-lambda-generator'



# Initialize S3 client
s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_DEFAULT_REGION', 'us-west-1')
)

# TODO: Check if the notebook already exists in s3
def notebook_exists(filename: str, bucket_name = bucket_name):
    try:
        print("Checking if notebook exists")
        print("S3 client:", s3)
        print(f"Using Access Key ID ending in: ...{os.environ['AWS_ACCESS_KEY_ID']}")
        print(f"Using Region: {os.environ['AWS_DEFAULT_REGION']}")
        print(f"Using Secret Access Key ending in: ...{os.environ['AWS_SECRET_ACCESS_KEY'][-4:]}")

        try:
            cli_key = subprocess.check_output(['aws', 'configure', 'get', 'aws_access_key_id']).decode().strip()
            print(f"CLI Access Key ID: ...{cli_key}")
        except:
            print("Could not read CLI credentials")
        # Actually get the notebook content instead of just checking metadata
        response = s3.get_object(Bucket=bucket_name, Key=filename)
        print("Response:", response)
        body = json.loads(response['Body'].read().decode('utf-8'))
        print("Body:", body)
        return True, body
    except Exception as e:
        logger.error(f"Error checking notebook: {e}")
        return False, None

# TODO: Save the notebook to s3.
def save_or_update_notebook(filename: str, notebook: dict, bucket_name = bucket_name):
    if not filename:
        raise ValueError("Filename is required")
    
    if not notebook:
        raise ValueError("Notebook is required")
    
    try:
        # Check if notebook exists and get its content if it does
        exists, existing_notebook = notebook_exists(filename)
        
        # Save notebook to S3
        aws_response = s3.put_object(Bucket=bucket_name, Key=filename, Body=json.dumps(notebook))
        
        # Generate the S3 URL for the object
        url = f"https://{bucket_name}.s3.amazonaws.com/{filename}"
        
        # Save URL to Supabase only if it's a new notebook
        if not exists:
            supabase.table('notebooks').upsert({'s3_url': url}).execute()
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Notebook saved successfully'}),
            'url': url
        }
    except Exception as e:
        logger.error(f"Error saving notebook: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error saving notebook'}),
            'url': None
        }
    
# TODO: Load the notebook from s3.
def load_notebook(filename: str, bucket_name = bucket_name):
    try:
        response = s3.get_object(Bucket=bucket_name, Key=filename)
        logger.info("Response:", response)
        return response.get('Body').read().decode('utf-8')
    except Exception as e:
        logger.error("Error:", e)
        return None
    

# TODO: Delete the notebook from s3.
def delete_notebook(filename: str, bucket_name = bucket_name):
    pass

